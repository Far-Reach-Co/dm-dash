import {
  DeleteObjectCommand,
  PutObjectCommand,
  type PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import { createReadStream, statSync, unlinkSync } from "fs";
import { Request } from "express";
import {
  AWS_ACCESS_KEY_ID,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
} from "../../config";
import { splitAtIndex } from "../../lib/utils";
import { userSubscriptionStatus } from "../../lib/enums";
import {
  badRequestError,
  notFoundError,
  payloadTooLargeError,
  paymentRequiredError,
  unauthorizedError,
} from "../../lib/httpErrors";
import { getUserByIdQuery } from "../queries/users";
import { getProjectQuery } from "../queries/projects";
import {
  getUserDataUsageLimitBytes,
  getWyrldDataUsageLimitBytes,
} from "../../lib/subscription";
import { getMetadata, resizeImage } from "../../lib/imageProcessing";
import logger from "../../lib/logger.js";

const s3 = new S3Client({
  region: AWS_REGION,
  ...(AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY
    ? {
        credentials: {
          accessKeyId: AWS_ACCESS_KEY_ID,
          secretAccessKey: AWS_SECRET_ACCESS_KEY,
        },
      }
    : {}),
});

function normalizeS3BucketAndKey(
  rawBucket: string,
  rawKey: string,
): { bucket: string; key: string } {
  const normalizedBucket = rawBucket.trim().replace(/^\/+|\/+$/g, "");
  const normalizedKey = rawKey.trim().replace(/^\/+/g, "");
  if (!normalizedBucket) throw badRequestError("Missing S3 bucket name");
  if (!normalizedKey) throw badRequestError("Missing S3 object key");

  const slashIndex = normalizedBucket.indexOf("/");
  if (slashIndex === -1) {
    return { bucket: normalizedBucket, key: normalizedKey };
  }

  const bucket = normalizedBucket.slice(0, slashIndex).trim();
  const prefix = normalizedBucket
    .slice(slashIndex + 1)
    .trim()
    .replace(/^\/+|\/+$/g, "");
  if (!bucket) throw badRequestError("Invalid S3 bucket configuration");
  return {
    bucket,
    key: prefix ? `${prefix}/${normalizedKey}` : normalizedKey,
  };
}

async function uploadToS3(params: PutObjectCommandInput): Promise<void> {
  if (!params.Bucket || !params.Key) {
    throw badRequestError("S3 upload requires Bucket and Key");
  }

  const { bucket, key } = normalizeS3BucketAndKey(
    String(params.Bucket),
    String(params.Key),
  );
  await s3.send(new PutObjectCommand({ ...params, Bucket: bucket, Key: key }));
}

export async function uploadFileToS3(
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

export async function deleteFromS3(bucket: string, key: string): Promise<void> {
  const normalized = normalizeS3BucketAndKey(bucket, key);
  await s3.send(
    new DeleteObjectCommand({
      Bucket: normalized.bucket,
      Key: normalized.key,
    }),
  );
}

export function computeAwsImageParamsFromRequest(req: Request) {
  if (!req.file) throw badRequestError("Missing file");
  const name = req.file.originalname;
  var ind2 = name.lastIndexOf(".");
  const type = splitAtIndex(name, ind2);
  const imageRef = req.file.filename + type[1];

  return {
    Bucket: `${req.body.bucket_name}/${req.body.folder_name}`,
    Key: imageRef,
  };
}

export async function checkUserDataUsageLimitReachedAndAuth(
  sessionUser: string | number | undefined,
  incomingBytes = 0,
) {
  if (!sessionUser) throw unauthorizedError();
  const userData = await getUserByIdQuery(sessionUser);
  const user = userData.rows[0];
  if (!user) throw notFoundError("User not found");
  const limitBytes = getUserDataUsageLimitBytes(Boolean(user.is_pro));
  const projectedUsage = Number(user.used_data_in_bytes || 0) + incomingBytes;

  if (projectedUsage > limitBytes) {
    if (!user.is_pro) {
      throw paymentRequiredError(userSubscriptionStatus.userIsNotPro);
    }
    throw payloadTooLargeError(userSubscriptionStatus.userDataHardLimitReached);
  }
}

export async function checkProjectDataUsageLimitReachedAndAuth(
  projectId: number | undefined,
  sessionUser: string | number | undefined,
  incomingBytes = 0,
) {
  if (!sessionUser) throw unauthorizedError();
  if (!projectId) throw badRequestError("Missing project ID");

  const projectData = await getProjectQuery(projectId);
  const project = projectData.rows[0];
  if (!project) throw notFoundError("Project not found");
  const limitBytes = getWyrldDataUsageLimitBytes(Boolean(project.is_pro));
  const projectedUsage = Number(project.used_data_in_bytes || 0) + incomingBytes;

  if (projectedUsage > limitBytes) {
    if (!project.is_pro) {
      throw paymentRequiredError(userSubscriptionStatus.projectIsNotPro);
    }
    throw payloadTooLargeError(userSubscriptionStatus.projectDataHardLimitReached);
  }
}

export async function makeImageSmall(filePath: string) {
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
    unlinkSync(filePath);
    return newFilePathFromResizedImage;
  } else return null;
}

export function readFileSize(filePath: string): number {
  return statSync(filePath).size;
}
