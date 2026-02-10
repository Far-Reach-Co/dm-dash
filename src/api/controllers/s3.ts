import { S3, config, CloudFront } from "aws-sdk";
import { readFileSync, statSync, unlinkSync } from "fs";
import { userSubscriptionStatus } from "../../lib/enums";
import {
  addImageQuery,
  editImageQuery,
  getImageQuery,
  getImagesQuery,
  removeImageQuery,
  Image,
} from "../queries/images";
import { getProjectQuery, editProjectQuery } from "../queries/projects";
import { Request, Response, NextFunction } from "express";
import { getMetadata, resizeImage } from "../../lib/imageProcessing";
import { splitAtIndex } from "../../lib/utils";
import { editUserQuery, getUserByIdQuery } from "../queries/users";
import { getTableViewQuery } from "../queries/tableViews.js";
import { getProjectUserByUserAndProjectQuery } from "../queries/projectUsers";
import path = require("path");
import fs = require("fs");
import { megabytesInBytes } from "../../lib/enums";
import { getRecordImagesByImageQuery } from "../queries/recordImage";
import { getRecordQuery, Record } from "../queries/record";
import { logEventAsync, EventType } from "../../lib/eventLogger";
import { redisClient } from "../../lib/socketUsers";
import logger from "../../lib/logger.js";

config.update({
  signatureVersion: "v4",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "us-east-1",
});

const s3 = new S3();

// Cache CloudFront signing credentials at module level (read once on startup)
const cloudFrontPrivateKeyPath = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "private_frc_cloudfront_key.pem",
);
const cloudFrontPrivateKey = fs.readFileSync(cloudFrontPrivateKeyPath, "utf8");
const cloudFrontKeyId = process.env.CLOUDFRONT_KEY_ID as string;
const cloudFrontSigner = new CloudFront.Signer(
  cloudFrontKeyId,
  cloudFrontPrivateKey,
);

// Signed URL cache settings - cache for 2.5 days (URLs expire in 3 days)
const SIGNED_URL_CACHE_TTL_SECONDS = 60 * 60 * 24 * 2.5; // 2.5 days
const SIGNED_URL_CACHE_PREFIX = "signed_url:";

// === Helper Functions ===

function getSignedUrlCacheKey(imageId: number | string): string {
  return `${SIGNED_URL_CACHE_PREFIX}${imageId}`;
}

async function invalidateSignedUrlCache(
  imageId: number | string,
): Promise<void> {
  await redisClient.del(getSignedUrlCacheKey(imageId));
}

function generateSignedUrl(fileName: string): string {
  const cloudFrontUrl = `https://${process.env.CLOUDFRONT_DISTRIBUTION_DOMAIN}/images/${fileName}`;
  const expiresAt = Math.floor((Date.now() + 60 * 60 * 24 * 3 * 1000) / 1000); // 3 days
  return cloudFrontSigner.getSignedUrl({
    url: cloudFrontUrl,
    expires: expiresAt,
  });
}

function cacheSignedUrl(imageId: number | string, url: string): void {
  redisClient
    .setEx(getSignedUrlCacheKey(imageId), SIGNED_URL_CACHE_TTL_SECONDS, url)
    .catch((err) =>
      logger.warn({ err, imageId }, "Failed to cache signed URL"),
    );
}

async function uploadToS3(params: S3.PutObjectRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    s3.upload(params, (err: any, data: { Location: string }) => {
      if (err) {
        reject(err);
      }
      resolve(data.Location);
    });
  });
}

async function deleteFromS3(bucket: string, key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    s3.deleteObject({ Bucket: bucket, Key: key }, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

interface GetSignedUrlsRequestObject {
  body: {
    image_ids: (string | number)[];
  };
}

async function getSignedUrlsHandler(
  req: GetSignedUrlsRequestObject, // note that the request object type will change
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.body.image_ids.length) return res.send([]);
    const imageDataList = await getImagesQuery(req.body.image_ids); // adjusted function to fetch multiple rows
    const urls = getSignedUrls(imageDataList.rows);
    return res.send({ urls });
  } catch (err) {
    return next(err);
  }
}

async function getSignedUrls(images: Image[]) {
  const urls: { [key: string]: string } = {};
  const uncachedImages: { id: number | string; url: string }[] = [];

  // Batch check cache for all images
  const cacheKeys = images.map((imageData) =>
    getSignedUrlCacheKey(imageData.id),
  );
  const cachedUrls = cacheKeys.length
    ? await redisClient.mGet(cacheKeys)
    : [];

  for (let i = 0; i < images.length; i++) {
    const imageData = images[i];
    const cachedUrl = cachedUrls[i];
    if (cachedUrl) {
      urls[imageData.id] = cachedUrl;
    } else {
      const signedUrl = generateSignedUrl(imageData.file_name);
      urls[imageData.id] = signedUrl;
      uncachedImages.push({ id: imageData.id, url: signedUrl });
    }
  }

  // Cache new URLs in background (don't await)
  if (uncachedImages.length) {
    Promise.all(
      uncachedImages.map(({ id, url }) =>
        redisClient
          .setEx(getSignedUrlCacheKey(id), SIGNED_URL_CACHE_TTL_SECONDS, url)
          .catch((err) =>
            logger.warn({ err, imageId: id }, "Failed to cache signed URL"),
          ),
      ),
    );
  }

  return urls;
}

// async function getSignedUrlForUpload(req: Request, res: Response, next: NextFunction) {
//   function splitAtIndex(value, index) {
//     return [value.substring(0, index), value.substring(index)];
//   }

//   const name = req.body.name;
//   const uuid = uuidv4();
//   var ind2 = name.lastIndexOf(".");
//   const type = splitAtIndex(name, ind2);
//   const imageRef = uuid + type[1];

//   const params = {
//     Bucket: req.body.bucket_name,
//     Fields: {
//       key: `${req.body.folder_name}/${imageRef}`,
//     },
//     Expires: 60 * 10,
//   };

//   try {
//     const url = await new Promise((resolve, reject) => {
//       s3.createPresignedPost(params, (err, url) => {
//         err ? reject(err) : resolve(url);
//       });
//     });
//     res.send({ url, imageRef });
//   } catch (err) {
//     next(err);
//   }
// }

interface NewImageForProjectRequestObject extends Request {
  body: {
    bucket_name: string;
    folder_name: string;
    project_id: number;
    make_image_small: boolean;
  };
}

function computeAwsImageParamsFromRequest(req: Request, filePath: string) {
  if (!req.file) throw new Error("Missing file");
  const name = req.file.originalname;
  var ind2 = name.lastIndexOf(".");
  const type = splitAtIndex(name, ind2);
  const imageRef = req.file.filename + type[1];

  return {
    Bucket: `${req.body.bucket_name}/${req.body.folder_name}`,
    Key: imageRef,
    Body: readFileSync(filePath),
  };
}

async function checkUserProLimitReachedAndAuth(
  sessionUser: string | number | undefined,
) {
  if (!sessionUser) throw new Error("User is not logged in");
  const userData = await getUserByIdQuery(sessionUser);
  const user = userData.rows[0];
  const userDataCount = user.used_data_in_bytes;

  if (userDataCount >= megabytesInBytes.fifty) {
    if (!user.is_pro)
      throw { status: 402, message: userSubscriptionStatus.userIsNotPro };
  }
}

async function checkProjectProLimitReachedAndAuth(
  projectId: number | undefined,
  sessionUser: string | number | undefined,
) {
  if (!sessionUser) throw new Error("User is not logged in");
  if (!projectId) throw new Error("Missing project ID");

  const projectData = await getProjectQuery(projectId);
  const project = projectData.rows[0];
  // auth
  if (sessionUser != project.user_id) {
    const projectUserData = await getProjectUserByUserAndProjectQuery(
      sessionUser,
      projectId,
    );
    if (!projectUserData.rows.length)
      throw new Error("Not authorized to update this resource");
  }

  const projectDataCount = project.used_data_in_bytes;

  if (projectDataCount >= megabytesInBytes.fifty) {
    if (!project.is_pro) {
      throw { status: 402, message: userSubscriptionStatus.projectIsNotPro };
    }
  }
}

async function makeImageSmall(filePath: string) {
  const smallImageWidth: number = 100;
  const imageMetadata = await getMetadata(filePath);
  if (
    imageMetadata &&
    imageMetadata.height &&
    imageMetadata.width &&
    imageMetadata.width > smallImageWidth
  ) {
    const aspectRatio = imageMetadata.width / imageMetadata.height;
    const newFilePathFromResizedImage = await resizeImage(
      filePath,
      smallImageWidth,
      smallImageWidth / aspectRatio,
    );
    // on success
    // remove previous file
    unlinkSync(filePath);
    // return new file location
    return newFilePathFromResizedImage;
  } else return null;
}

async function newImageForProject(
  req: NewImageForProjectRequestObject,
  res: Response,
  next: NextFunction,
) {
  if (!req.file) return next();

  let filePath = `file_uploads/${req.file.filename}`;

  try {
    await checkProjectProLimitReachedAndAuth(
      req.body.project_id,
      req.session.user,
    );

    const params = computeAwsImageParamsFromRequest(req, filePath);
    let fileSize = req.file.size;

    if (req.body.make_image_small) {
      const newFilePathFromResizedImage = await makeImageSmall(filePath);
      if (newFilePathFromResizedImage) {
        filePath = newFilePathFromResizedImage;
        params.Body = readFileSync(newFilePathFromResizedImage);
        const stats = statSync(newFilePathFromResizedImage);
        fileSize = stats.size;
      }
    }

    const imageData = await addImageQuery({
      original_name: req.file.originalname,
      size: fileSize,
      file_name: params.Key,
    });
    const image = imageData.rows[0];

    await uploadToS3(params as S3.PutObjectRequest);

    logEventAsync({
      userId: req.session.user,
      projectId: req.body.project_id,
      eventType: EventType.IMAGE_UPLOADED,
      eventData: {
        imageId: image.id,
        fileName: image.original_name,
        fileSize: image.size,
      },
      req,
    });

    // Update project data usage
    const projectData = await getProjectQuery(req.body.project_id);
    const project = projectData.rows[0];
    await editProjectQuery(project.id, {
      used_data_in_bytes: project.used_data_in_bytes + image.size,
    });

    const signedUrl = generateSignedUrl(image.file_name);
    cacheSignedUrl(image.id, signedUrl);

    res.send({ ...image, src: signedUrl });
  } catch (err) {
    return next(err);
  } finally {
    try {
      unlinkSync(filePath);
    } catch {
      // File may not exist if error occurred before creation
    }
  }
}

interface NewImageForUserRequestObject extends Request {
  body: {
    bucket_name: string;
    folder_name: string;
    make_image_small: boolean;
  };
}

async function newImageForUser(
  req: NewImageForUserRequestObject,
  res: Response,
  next: NextFunction,
) {
  if (!req.file) return next();

  let filePath = `file_uploads/${req.file.filename}`;

  try {
    if (!req.session.user) throw new Error("User is not logged in");

    await checkUserProLimitReachedAndAuth(req.session.user);

    const params = computeAwsImageParamsFromRequest(req, filePath);
    let fileSize = req.file.size;

    if (req.body.make_image_small) {
      const newFilePathFromResizedImage = await makeImageSmall(filePath);
      if (newFilePathFromResizedImage) {
        filePath = newFilePathFromResizedImage;
        params.Body = readFileSync(newFilePathFromResizedImage);
        const stats = statSync(newFilePathFromResizedImage);
        fileSize = stats.size;
      }
    }

    const imageData = await addImageQuery({
      original_name: req.file.originalname,
      size: fileSize,
      file_name: params.Key,
    });
    const image = imageData.rows[0];

    await uploadToS3(params as S3.PutObjectRequest);

    logEventAsync({
      userId: req.session.user,
      eventType: EventType.IMAGE_UPLOADED,
      eventData: {
        imageId: image.id,
        fileName: image.original_name,
        fileSize: image.size,
      },
      req,
    });

    // Update user data usage
    const userData = await getUserByIdQuery(req.session.user);
    const user = userData.rows[0];
    await editUserQuery(user.id, {
      used_data_in_bytes: user.used_data_in_bytes + image.size,
    });

    const signedUrl = generateSignedUrl(image.file_name);
    cacheSignedUrl(image.id, signedUrl);

    res.send({ ...image, src: signedUrl });
  } catch (err) {
    return next(err);
  } finally {
    try {
      unlinkSync(filePath);
    } catch {
      // File may not exist if error occurred before creation
    }
  }
}

interface imageDataResObject extends Image {
  src: string;
  records: Record[];
}

async function getImage(req: Request, res: Response, next: NextFunction) {
  try {
    const imageData = await getImageQuery(req.params.id);
    const image = imageData.rows[0] as imageDataResObject;

    const cacheKey = getSignedUrlCacheKey(image.id);
    const cachedUrl = await redisClient.get(cacheKey);

    if (cachedUrl) {
      image.src = cachedUrl;
    } else {
      image.src = generateSignedUrl(image.file_name);
      cacheSignedUrl(image.id, image.src);
    }

    const recordImageData = await getRecordImagesByImageQuery(image.id);
    const recordsData = await Promise.all(
      recordImageData.rows.map(async (ri) => {
        const recordData = await getRecordQuery(ri.record_id);
        return recordData.rows[0];
      }),
    );
    image.records = recordsData;
    res.send(image);
  } catch (err) {
    logger.error({ err, imageId: req.params.id }, "Failed to get image");
    next(err);
  }
}

async function removeImageByProject(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const imageData = await getImageQuery(req.params.image_id);
    const image = imageData.rows[0];

    await deleteFromS3("wyrld/images", image.file_name);
    await removeImageQuery(req.params.image_id);

    invalidateSignedUrlCache(req.params.image_id).catch((err) =>
      logger.warn(
        { err, imageId: req.params.image_id },
        "Failed to invalidate signed URL cache",
      ),
    );

    const projectData = await getProjectQuery(req.params.project_id);
    const project = projectData.rows[0];
    await editProjectQuery(project.id, {
      used_data_in_bytes: project.used_data_in_bytes - image.size,
    });

    logEventAsync({
      userId: req.session.user,
      projectId: req.params.project_id,
      eventType: EventType.IMAGE_DELETED,
      eventData: {
        imageId: req.params.image_id,
        fileName: image.original_name,
        fileSize: image.size,
      },
      req,
    });
    res.status(204).send();
  } catch (err) {
    logger.error(
      { err, imageId: req.params.image_id, projectId: req.params.project_id },
      "Failed to remove image by project",
    );
    next(err);
  }
}

async function removeImageByTableUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const imageData = await getImageQuery(req.params.image_id);
    const image = imageData.rows[0];

    await deleteFromS3("wyrld/images", image.file_name);
    await removeImageQuery(req.params.image_id);

    invalidateSignedUrlCache(req.params.image_id).catch((err) =>
      logger.warn(
        { err, imageId: req.params.image_id },
        "Failed to invalidate signed URL cache",
      ),
    );

    const tableData = await getTableViewQuery(req.params.table_id);
    const table = tableData.rows[0];

    const userData = await getUserByIdQuery(table.user_id);
    const user = userData.rows[0];
    await editUserQuery(user.id, {
      used_data_in_bytes: user.used_data_in_bytes - image.size,
    });

    logEventAsync({
      userId: req.session.user,
      eventType: EventType.IMAGE_DELETED,
      eventData: {
        imageId: req.params.image_id,
        fileName: image.original_name,
        fileSize: image.size,
      },
      req,
    });
    res.status(204).send();
  } catch (err) {
    logger.error(
      { err, imageId: req.params.image_id, tableId: req.params.table_id },
      "Failed to remove image by table user",
    );
    next(err);
  }
}

async function removeImageFromBucket(
  bucket: string,
  image: { file_name: string },
) {
  try {
    await deleteFromS3(bucket, image.file_name);
  } catch (err) {
    logger.error(
      { err, bucket, fileName: image.file_name },
      "Failed to remove image from bucket",
    );
  }
}

async function editImageName(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await editImageQuery(req.params.id, {
      original_name: req.body.original_name,
    });
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function editImageNotes(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await editImageQuery(req.params.id, {
      notes: req.body.notes,
    });
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export {
  getSignedUrls,
  getSignedUrlsHandler,
  getImage,
  editImageName,
  newImageForProject,
  newImageForUser,
  removeImageFromBucket,
  removeImageByProject,
  removeImageByTableUser,
  editImageNotes,
};
