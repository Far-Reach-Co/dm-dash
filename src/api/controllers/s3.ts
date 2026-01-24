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
  "private_frc_cloudfront_key.pem"
);
const cloudFrontPrivateKey = fs.readFileSync(cloudFrontPrivateKeyPath, "utf8");
const cloudFrontKeyId = process.env.CLOUDFRONT_KEY_ID as string;
const cloudFrontSigner = new CloudFront.Signer(cloudFrontKeyId, cloudFrontPrivateKey);

// Signed URL cache settings - cache for 2.5 days (URLs expire in 3 days)
const SIGNED_URL_CACHE_TTL_SECONDS = 60 * 60 * 24 * 2.5; // 2.5 days
const SIGNED_URL_CACHE_PREFIX = "signed_url:";

function getSignedUrlCacheKey(imageId: number | string): string {
  return `${SIGNED_URL_CACHE_PREFIX}${imageId}`;
}

async function invalidateSignedUrlCache(imageId: number | string): Promise<void> {
  await redisClient.del(getSignedUrlCacheKey(imageId));
}

interface GetSignedUrlsRequestObject {
  body: {
    image_ids: (string | number)[];
  };
}

async function getSignedUrlsHandler(
  req: GetSignedUrlsRequestObject, // note that the request object type will change
  res: Response,
  next: NextFunction
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

  // Check cache first for all images
  for (const imageData of images) {
    const cacheKey = getSignedUrlCacheKey(imageData.id);
    const cachedUrl = await redisClient.get(cacheKey);

    if (cachedUrl) {
      urls[imageData.id] = cachedUrl;
    } else {
      // Generate signed URL
      const cloudFrontUrl = `https://${process.env.CLOUDFRONT_DISTRIBUTION_DOMAIN}/images/${imageData.file_name}`;
      const expiresAt = Math.floor((Date.now() + 60 * 60 * 24 * 3 * 1000) / 1000); // 3 days
      const signedUrl = cloudFrontSigner.getSignedUrl({
        url: cloudFrontUrl,
        expires: expiresAt,
      });
      urls[imageData.id] = signedUrl;
      uncachedImages.push({ id: imageData.id, url: signedUrl });
    }
  }

  // Cache new URLs in background (don't await)
  if (uncachedImages.length > 0) {
    Promise.all(
      uncachedImages.map(({ id, url }) =>
        redisClient.setEx(getSignedUrlCacheKey(id), SIGNED_URL_CACHE_TTL_SECONDS, url)
      )
    ).catch((err) => console.error("Failed to cache signed URLs:", err));
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
    current_file_id?: number;
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
  sessionUser: string | number | undefined
) {
  if (!sessionUser) throw new Error("User is not logged in");
  const userData = await getUserByIdQuery(sessionUser);
  const user = userData.rows[0];
  const userDataCount = user.used_data_in_bytes;

  if (userDataCount >= megabytesInBytes.oneHundred) {
    if (!user.is_pro)
      throw { status: 402, message: userSubscriptionStatus.userIsNotPro };
  }
}

async function checkProjectProLimitReachedAndAuth(
  projectId: number | undefined,
  sessionUser: string | number | undefined
) {
  if (!sessionUser) throw new Error("User is not logged in");
  if (!projectId) throw new Error("Missing project ID");

  const projectData = await getProjectQuery(projectId);
  const project = projectData.rows[0];
  // auth
  if (sessionUser != project.user_id) {
    const projectUserData = await getProjectUserByUserAndProjectQuery(
      sessionUser,
      projectId
    );
    if (!projectUserData.rows.length)
      throw new Error("Not authorized to update this resource");
  }

  const projectDataCount = project.used_data_in_bytes;

  if (projectDataCount >= megabytesInBytes.oneHundred) {
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
      smallImageWidth / aspectRatio
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
  next: NextFunction
) {
  // error if no file
  if (!req.file) return next();
  // setup
  let filePath = `file_uploads/${req.file.filename}`;
  let image = null;

  try {
    // check project data usage and pro account status
    await checkProjectProLimitReachedAndAuth(
      req.body.project_id,
      req.session.user
    );

    const params = computeAwsImageParamsFromRequest(req, filePath);
    let fileSize = req.file.size;

    // adjust image size
    if (req.body.make_image_small) {
      const newFilePathFromResizedImage = await makeImageSmall(filePath);
      // if we have a new file
      if (newFilePathFromResizedImage) {
        // set new file path to resized image
        filePath = newFilePathFromResizedImage;
        // update params for aws upload
        params.Body = readFileSync(newFilePathFromResizedImage);
        // update file size
        const stats = statSync(newFilePathFromResizedImage);
        const fileSizeInBytes = stats.size;
        fileSize = fileSizeInBytes;
      }
    }

    // save image in db
    const imageData = await addImageQuery({
      original_name: req.file.originalname,
      size: fileSize,
      file_name: params.Key,
    });
    image = imageData.rows[0];

    // make an upload to s3 bucket
    await new Promise((resolve, reject) => {
      s3.upload(params, (err: any, data: { Location: unknown }) => {
        if (err) {
          reject(err);
        }
        resolve(data.Location);
      });
    });
    // Log image upload event
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

    // Generate signed URL for immediate use
    const cloudFrontUrl = `https://${process.env.CLOUDFRONT_DISTRIBUTION_DOMAIN}/images/${image.file_name}`;
    const expiresAt = Math.floor((Date.now() + 60 * 60 * 24 * 3 * 1000) / 1000); // 3 days
    const signedUrl = cloudFrontSigner.getSignedUrl({
      url: cloudFrontUrl,
      expires: expiresAt,
    });

    // Cache the signed URL in background
    redisClient
      .setEx(getSignedUrlCacheKey(image.id), SIGNED_URL_CACHE_TTL_SECONDS, signedUrl)
      .catch((err) => console.error("Failed to cache signed URL:", err));

    // send back to client with signed URL
    res.send({ ...image, src: signedUrl });
  } catch (err) {
    // delete file in storage
    unlinkSync(filePath);
    return next(err);
  }
  // continue

  // delete file in storage
  unlinkSync(filePath);

  try {
    // prepare to update project data usage
    let dataUsageCount = 0;
    dataUsageCount += image.size;
    // if current file, remove current file (which is being replaced with the new file) from the bucket
    if (req.body.current_file_id) {
      const oldImageData = await getImageQuery(req.body.current_file_id);
      const oldImage = oldImageData.rows[0];

      await removeImageFromBucket(
        `${req.body.bucket_name}/${req.body.folder_name}`,
        oldImage
      );
      await removeImageQuery(req.body.current_file_id);

      // Invalidate signed URL cache for replaced image
      invalidateSignedUrlCache(req.body.current_file_id).catch((err) =>
        console.error("Failed to invalidate signed URL cache:", err)
      );

      dataUsageCount -= oldImage.size;
    }
    // update project data usage
    const projectData = await getProjectQuery(req.body.project_id);
    const project = projectData.rows[0];
    const newCalculatedData = project.used_data_in_bytes + dataUsageCount;
    await editProjectQuery(project.id, {
      used_data_in_bytes: newCalculatedData,
    });
  } catch (err) {
    console.log(err);
    next(err);
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
  next: NextFunction
) {
  // error if no file
  if (!req.file) return next();
  // setup
  let filePath = `file_uploads/${req.file.filename}`;
  let image = null;

  try {
    if (!req.session.user) throw new Error("User is not logged in");
    // check user data usage and pro account status
    await checkUserProLimitReachedAndAuth(req.session.user);

    const params = computeAwsImageParamsFromRequest(req, filePath);
    let fileSize = req.file.size;

    // adjust image size
    if (req.body.make_image_small) {
      const newFilePathFromResizedImage = await makeImageSmall(filePath);
      // if we have a new file
      if (newFilePathFromResizedImage) {
        // set new file path to resized image
        filePath = newFilePathFromResizedImage;
        // update params for aws upload
        params.Body = readFileSync(newFilePathFromResizedImage);
        // update file size
        const stats = statSync(newFilePathFromResizedImage);
        const fileSizeInBytes = stats.size;
        fileSize = fileSizeInBytes;
      }
    }

    // save image in db
    const imageData = await addImageQuery({
      original_name: req.file.originalname,
      size: fileSize,
      file_name: params.Key,
    });
    image = imageData.rows[0];

    // make an upload to s3 bucket
    await new Promise((resolve, reject) => {
      s3.upload(params, (err: any, data: { Location: unknown }) => {
        if (err) {
          reject(err);
        }
        resolve(data.Location);
      });
    });
    // Log image upload event
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

    // Generate signed URL for immediate use
    const cloudFrontUrl = `https://${process.env.CLOUDFRONT_DISTRIBUTION_DOMAIN}/images/${image.file_name}`;
    const expiresAt = Math.floor((Date.now() + 60 * 60 * 24 * 3 * 1000) / 1000); // 3 days
    const signedUrl = cloudFrontSigner.getSignedUrl({
      url: cloudFrontUrl,
      expires: expiresAt,
    });

    // Cache the signed URL in background
    redisClient
      .setEx(getSignedUrlCacheKey(image.id), SIGNED_URL_CACHE_TTL_SECONDS, signedUrl)
      .catch((err) => console.error("Failed to cache signed URL:", err));

    // send back to client with signed URL
    res.send({ ...image, src: signedUrl });
  } catch (err) {
    // delete file in storage
    unlinkSync(filePath);
    return next(err);
  }
  // continue

  // delete file in storage
  unlinkSync(filePath);

  try {
    // prepare to update user data usage
    let dataUsageCount = 0;
    dataUsageCount += image.size;
    // update user data usage
    const userData = await getUserByIdQuery(req.session.user);
    const user = userData.rows[0];
    const newCalculatedData = user.used_data_in_bytes + dataUsageCount;
    await editUserQuery(user.id, {
      used_data_in_bytes: newCalculatedData,
    });
  } catch (err) {
    console.log(err);
    next(err);
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

    // Check Redis cache first
    const cacheKey = getSignedUrlCacheKey(image.id);
    const cachedUrl = await redisClient.get(cacheKey);

    if (cachedUrl) {
      image.src = cachedUrl;
    } else {
      // Generate signed URL using cached signer
      const cloudFrontUrl = `https://${process.env.CLOUDFRONT_DISTRIBUTION_DOMAIN}/images/${image.file_name}`;
      const expiresAt = Math.floor((Date.now() + 60 * 60 * 24 * 3 * 1000) / 1000); // 3 days from now

      image.src = cloudFrontSigner.getSignedUrl({
        url: cloudFrontUrl,
        expires: expiresAt,
      });

      // Cache in background
      redisClient
        .setEx(cacheKey, SIGNED_URL_CACHE_TTL_SECONDS, image.src)
        .catch((err) => console.error("Failed to cache signed URL:", err));
    }

    // Get and append recordImage id
    const recordImageData = await getRecordImagesByImageQuery(image.id);
    const recordsData = await Promise.all(
      recordImageData.rows.map(async (ri) => {
        const recordData = await getRecordQuery(ri.record_id);
        const record = recordData.rows[0];
        return record;
      })
    );
    image.records = recordsData;
    res.send(image);
  } catch (err) {
    console.log(err);
    next(err);
  }
}

async function removeImageByProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // remove current file
    const imageData = await getImageQuery(req.params.image_id);
    const image = imageData.rows[0];

    await removeImageFromBucket("wyrld/images", image);
    await removeImageQuery(req.params.image_id);

    // Invalidate signed URL cache
    invalidateSignedUrlCache(req.params.image_id).catch((err) =>
      console.error("Failed to invalidate signed URL cache:", err)
    );

    // update project data usage
    const projectData = await getProjectQuery(req.params.project_id);
    const project = projectData.rows[0];
    const newCalculatedData = project.used_data_in_bytes - image.size;
    await editProjectQuery(project.id, {
      used_data_in_bytes: newCalculatedData,
    });
    // Log image deletion event
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
    console.log(err);
    next(err);
  }
}

async function removeImageByTableUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // remove current file
    const imageData = await getImageQuery(req.params.image_id);
    const image = imageData.rows[0];

    await removeImageFromBucket("wyrld/images", image);
    await removeImageQuery(req.params.image_id);

    // Invalidate signed URL cache
    invalidateSignedUrlCache(req.params.image_id).catch((err) =>
      console.error("Failed to invalidate signed URL cache:", err)
    );

    // get table
    const tableData = await getTableViewQuery(req.params.table_id);
    const table = tableData.rows[0];

    // update user data usage
    const userData = await getUserByIdQuery(table.user_id);
    const user = userData.rows[0];
    const newCalculatedData = user.used_data_in_bytes - image.size;
    await editUserQuery(user.id, {
      used_data_in_bytes: newCalculatedData,
    });
    // Log image deletion event
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
    console.log(err);
    next(err);
  }
}

async function removeImageFromBucket(
  bucket: string,
  image: { file_name: string }
) {
  try {
    const params = {
      Bucket: bucket,
      Key: image.file_name,
    };

    await new Promise((resolve, reject) => {
      s3.deleteObject(params, (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data.DeleteMarker);
      });
    });
  } catch (err) {
    console.log(err);
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
