import {
  DeleteObjectCommand,
  PutObjectCommand,
  type PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl as getCloudFrontSignedUrl } from "@aws-sdk/cloudfront-signer";
import { createReadStream, statSync, unlinkSync } from "fs";
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
import { getProjectUserByUserAndProjectQuery } from "../queries/projectUsers";
import {
  getTableImagesByImageQuery,
  getTableImagesByProjectQuery,
  getTableImagesByUserQuery,
} from "../queries/tableImages";
import path = require("path");
import fs = require("fs");
import { megabytesInBytes } from "../../lib/enums";
import { getRecordImagesByImageQuery } from "../queries/recordImage";
import { getRecordQuery, Record } from "../queries/record";
import { logEventAsync, EventType } from "../../lib/eventLogger";
import { redisClient } from "../../lib/socketUsers";
import logger from "../../lib/logger.js";
import { getProjectAccess, requireProjectEditor, requireUser } from "../../lib/authz";
import {
  assertProjectIdMatchesTable,
  forbiddenError,
  getOptionalTableEditAuth,
  notFoundError,
  requireProjectIdFromTable,
  requireTablePermissionById,
  requireUserIdFromTable,
} from "./tableResourceUtils";

const awsRegion = process.env.AWS_REGION || "us-east-1";
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const s3 = new S3Client({
  region: awsRegion,
  ...(awsAccessKeyId && awsSecretAccessKey
    ? {
        credentials: {
          accessKeyId: awsAccessKeyId,
          secretAccessKey: awsSecretAccessKey,
        },
      }
    : {}),
});

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

async function getOptionalTableAuthForImageMutation(req: Request) {
  return await getOptionalTableEditAuth(req, "canManageImageAssets");
}

async function ensureImageLinkedToProject(
  imageId: string | number,
  projectId: string | number,
) {
  const rows = (await getTableImagesByProjectQuery(projectId)).rows;
  const linked = rows.some(
    (row) => String(row.image_id) === String(imageId),
  );
  if (!linked) throw notFoundError("Image not found in this project");
}

async function ensureImageLinkedToUser(
  imageId: string | number,
  userId: string | number,
) {
  const rows = (await getTableImagesByUserQuery(userId)).rows;
  const linked = rows.some(
    (row) => String(row.image_id) === String(imageId),
  );
  if (!linked) throw notFoundError("Image not found in your library");
}

async function ensureImageEditableWithoutTableContext(
  req: Request,
  imageId: string | number,
) {
  const userId = requireUser(req);
  const tableImages = (await getTableImagesByImageQuery(imageId)).rows;
  if (!tableImages.length) throw notFoundError("Image not found");

  const checkedProjects = new Map<string, boolean>();
  for (const tableImage of tableImages) {
    if (tableImage.user_id) {
      if (String(tableImage.user_id) === String(userId)) return;
      continue;
    }
    if (!tableImage.project_id) continue;
    const key = String(tableImage.project_id);
    if (!checkedProjects.has(key)) {
      const access = await getProjectAccess(req, tableImage.project_id);
      checkedProjects.set(key, Boolean(access?.isEditor));
    }
    if (checkedProjects.get(key)) return;
  }

  throw forbiddenError();
}

async function ensureImageEditableWithOptionalTableContext(
  req: Request,
  imageId: string | number,
) {
  const tableAuth = await getOptionalTableAuthForImageMutation(req);
  if (!tableAuth) {
    await ensureImageEditableWithoutTableContext(req, imageId);
    return;
  }

  if (tableAuth.table.project_id) {
    await ensureImageLinkedToProject(imageId, tableAuth.table.project_id);
    return;
  }

  if (tableAuth.table.user_id) {
    await ensureImageLinkedToUser(imageId, tableAuth.table.user_id);
    return;
  }

  throw forbiddenError();
}

function getImageOrThrow(imageData: { rows: Array<any> }) {
  const image = imageData.rows[0];
  if (!image) throw notFoundError("Image not found");
  return image;
}

function generateSignedUrl(fileName: string): string {
  const cloudFrontUrl = `https://${process.env.CLOUDFRONT_DISTRIBUTION_DOMAIN}/images/${fileName}`;
  const expiresAt = new Date(Date.now() + 60 * 60 * 24 * 3 * 1000); // 3 days
  return getCloudFrontSignedUrl({
    url: cloudFrontUrl,
    keyPairId: cloudFrontKeyId,
    privateKey: cloudFrontPrivateKey,
    dateLessThan: expiresAt.toISOString(),
  });
}

function cacheSignedUrl(imageId: number | string, url: string): void {
  redisClient
    .setEx(getSignedUrlCacheKey(imageId), SIGNED_URL_CACHE_TTL_SECONDS, url)
    .catch((err) =>
      logger.warn({ err, imageId }, "Failed to cache signed URL"),
    );
}

function normalizeS3BucketAndKey(
  rawBucket: string,
  rawKey: string,
): { bucket: string; key: string } {
  const normalizedBucket = rawBucket.trim().replace(/^\/+|\/+$/g, "");
  const normalizedKey = rawKey.trim().replace(/^\/+/g, "");
  if (!normalizedBucket) throw new Error("Missing S3 bucket name");
  if (!normalizedKey) throw new Error("Missing S3 object key");

  const slashIndex = normalizedBucket.indexOf("/");
  if (slashIndex === -1) {
    return { bucket: normalizedBucket, key: normalizedKey };
  }

  const bucket = normalizedBucket.slice(0, slashIndex).trim();
  const prefix = normalizedBucket
    .slice(slashIndex + 1)
    .trim()
    .replace(/^\/+|\/+$/g, "");
  if (!bucket) throw new Error("Invalid S3 bucket configuration");
  return {
    bucket,
    key: prefix ? `${prefix}/${normalizedKey}` : normalizedKey,
  };
}

async function uploadToS3(params: PutObjectCommandInput): Promise<void> {
  if (!params.Bucket || !params.Key) {
    throw new Error("S3 upload requires Bucket and Key");
  }

  const { bucket, key } = normalizeS3BucketAndKey(
    String(params.Bucket),
    String(params.Key),
  );
  await s3.send(new PutObjectCommand({ ...params, Bucket: bucket, Key: key }));
}

async function uploadFileToS3(
  params: Omit<PutObjectCommandInput, "Body">,
  filePath: string,
): Promise<void> {
  const bodyStream = createReadStream(filePath);
  bodyStream.once("error", (err) => {
    logger.warn({ err, filePath }, "S3 upload file stream error");
  });

  try {
    await uploadToS3({
      ...params,
      Body: bodyStream,
    });
  } finally {
    bodyStream.destroy();
  }
}

async function deleteFromS3(bucket: string, key: string): Promise<void> {
  const normalized = normalizeS3BucketAndKey(bucket, key);
  await s3.send(
    new DeleteObjectCommand({
      Bucket: normalized.bucket,
      Key: normalized.key,
    }),
  );
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

function computeAwsImageParamsFromRequest(req: Request) {
  if (!req.file) throw new Error("Missing file");
  const name = req.file.originalname;
  var ind2 = name.lastIndexOf(".");
  const type = splitAtIndex(name, ind2);
  const imageRef = req.file.filename + type[1];

  return {
    Bucket: `${req.body.bucket_name}/${req.body.folder_name}`,
    Key: imageRef,
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
    const tableAuth = await getOptionalTableAuthForImageMutation(req);
    if (tableAuth) {
      req.body.project_id = Number(requireProjectIdFromTable(tableAuth.table));
    }
    await checkProjectProLimitReachedAndAuth(
      req.body.project_id,
      req.session.user,
    );

    const params = computeAwsImageParamsFromRequest(req);
    let fileSize = req.file.size;

    if (req.body.make_image_small) {
      const newFilePathFromResizedImage = await makeImageSmall(filePath);
      if (newFilePathFromResizedImage) {
        filePath = newFilePathFromResizedImage;
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

    await uploadFileToS3(params, filePath);

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
    const tableAuth = await getOptionalTableAuthForImageMutation(req);
    if (tableAuth) {
      requireUserIdFromTable(tableAuth.table);
    }

    await checkUserProLimitReachedAndAuth(req.session.user);

    const params = computeAwsImageParamsFromRequest(req);
    let fileSize = req.file.size;

    if (req.body.make_image_small) {
      const newFilePathFromResizedImage = await makeImageSmall(filePath);
      if (newFilePathFromResizedImage) {
        filePath = newFilePathFromResizedImage;
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

    await uploadFileToS3(params, filePath);

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
    await requireProjectEditor(req, req.params.project_id);
    const tableAuth = await getOptionalTableAuthForImageMutation(req);
    if (tableAuth) {
      const tableProjectId = requireProjectIdFromTable(tableAuth.table);
      assertProjectIdMatchesTable(req.params.project_id, tableProjectId);
    }
    await ensureImageLinkedToProject(req.params.image_id, req.params.project_id);
    const imageData = await getImageQuery(req.params.image_id);
    const image = getImageOrThrow(imageData);

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
    if (String(project.image_id) === String(req.params.image_id)) {
      await editProjectQuery(project.id, {
        image_id: null,
      });
    }

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
    const { table: tableForAuth } = await requireTablePermissionById(
      req,
      req.params.table_id,
      "edit",
      "canManageImageAssets",
    );
    const tableUserId = requireUserIdFromTable(tableForAuth, "table_id");

    await ensureImageLinkedToUser(req.params.image_id, tableUserId);
    const imageData = await getImageQuery(req.params.image_id);
    const image = getImageOrThrow(imageData);

    await deleteFromS3("wyrld/images", image.file_name);
    await removeImageQuery(req.params.image_id);

    invalidateSignedUrlCache(req.params.image_id).catch((err) =>
      logger.warn(
        { err, imageId: req.params.image_id },
        "Failed to invalidate signed URL cache",
      ),
    );

    const userData = await getUserByIdQuery(tableUserId);
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

async function removeImageByUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = requireUser(req);
    const tableAuth = await getOptionalTableAuthForImageMutation(req);
    if (tableAuth) {
      requireUserIdFromTable(tableAuth.table);
    }

    await ensureImageLinkedToUser(req.params.image_id, userId);
    const imageData = await getImageQuery(req.params.image_id);
    const image = getImageOrThrow(imageData);

    await deleteFromS3("wyrld/images", image.file_name);
    await removeImageQuery(req.params.image_id);

    invalidateSignedUrlCache(req.params.image_id).catch((err) =>
      logger.warn(
        { err, imageId: req.params.image_id },
        "Failed to invalidate signed URL cache",
      ),
    );

    const userData = await getUserByIdQuery(userId);
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
      { err, imageId: req.params.image_id },
      "Failed to remove image by user",
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
    requireUser(req);
    await ensureImageEditableWithOptionalTableContext(req, req.params.id);
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
    requireUser(req);
    await ensureImageEditableWithOptionalTableContext(req, req.params.id);
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
  removeImageByUser,
  editImageNotes,
};
