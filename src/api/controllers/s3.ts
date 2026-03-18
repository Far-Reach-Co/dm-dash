import { unlinkSync } from "fs";
import {
  addImageQuery,
  editImageQuery,
  getImageQuery,
  getImagesQuery,
  Image,
} from "../queries/images";
import { getProjectQuery, editProjectQuery } from "../queries/projects";
import { Request, Response, NextFunction } from "express";
import { editUserQuery, getUserByIdQuery } from "../queries/users";
import {
  getRecordImagesByImageQuery,
} from "../queries/recordImage";
import { getRecordQuery, Record } from "../queries/record";
import { logEventAsync, EventType } from "../../lib/eventLogger";
import { redisClient } from "../../lib/socketUsers";
import logger from "../../lib/logger.js";
import { unlinkImageAndDeleteIfOrphaned } from "../../lib/imageLifecycle";
import {
  assertProjectIdMatchesTable,
  requireProjectIdFromTable,
  requireTablePermissionById,
  requireUserIdFromTable,
} from "./tableResourceUtils";
import {
  requireApiUser,
  requireProjectEditorAccess,
  requireRecordViewAccess,
} from "./accessControl";
import {
  cacheSignedUrl,
  generateSignedUrl,
  getSignedUrlCacheKey,
  getSignedUrls,
  invalidateSignedUrlCache,
} from "./s3SignedUrls";
import {
  ensureImageEditableWithOptionalTableContext,
  ensureImageLinkedToProject,
  ensureImageLinkedToUser,
  ensureImageViewable,
  getImageOrThrow,
  getOptionalTableAuthForImageMutation,
  resolveImageViewScope,
} from "./s3ImageAccess";
import {
  checkProjectDataUsageLimitReachedAndAuth,
  checkUserDataUsageLimitReachedAndAuth,
  computeAwsImageParamsFromRequest,
  deleteFromS3,
  makeImageSmall,
  readFileSize,
  uploadFileToS3,
} from "./s3StorageUtils";

interface GetSignedUrlsRequestObject extends Request {
  body: {
    image_ids: (string | number)[];
    table_view_id?: string | number;
    guest_uuid?: string;
  };
}

async function getSignedUrlsHandler(
  req: GetSignedUrlsRequestObject,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.body.image_ids.length) return res.send([]);
    const scope = await resolveImageViewScope(req);
    await Promise.all(
      req.body.image_ids.map((imageId) => ensureImageViewable(req, imageId, scope)),
    );
    const imageDataList = await getImagesQuery(req.body.image_ids);
    const urls = await getSignedUrls(imageDataList.rows);
    return res.send({ urls });
  } catch (err) {
    return next(err);
  }
}

interface NewImageForProjectRequestObject extends Request {
  body: {
    bucket_name: string;
    folder_name: string;
    project_id: number;
    make_image_small: boolean;
  };
}

type ImageOwnerScope =
  | { kind: "project"; projectId: string | number }
  | { kind: "user"; userId: string | number };

type PreparedUpload = {
  filePath: string;
  fileSize: number;
};

function getTempUploadPath(req: Request) {
  if (!req.file) throw new Error("Missing file");
  return `file_uploads/${req.file.filename}`;
}

async function resolveProjectUploadScope(
  req: NewImageForProjectRequestObject,
): Promise<ImageOwnerScope> {
  const tableAuth = await getOptionalTableAuthForImageMutation(req);
  if (tableAuth) {
    return {
      kind: "project",
      projectId: requireProjectIdFromTable(tableAuth.table),
    };
  }

  await requireProjectEditorAccess(req, req.body.project_id);
  return {
    kind: "project",
    projectId: req.body.project_id,
  };
}

async function resolveUserUploadScope(
  req: NewImageForUserRequestObject,
): Promise<ImageOwnerScope> {
  const userId = requireApiUser(req);
  const tableAuth = await getOptionalTableAuthForImageMutation(req);
  if (tableAuth) {
    requireUserIdFromTable(tableAuth.table);
  }

  return {
    kind: "user",
    userId,
  };
}

async function prepareUpload(
  filePath: string,
  fileSize: number,
  makeSmall: boolean,
): Promise<PreparedUpload> {
  if (!makeSmall) {
    return { filePath, fileSize };
  }

  const resizedFilePath = await makeImageSmall(filePath);
  if (!resizedFilePath) {
    return { filePath, fileSize };
  }

  return {
    filePath: resizedFilePath,
    fileSize: readFileSize(resizedFilePath),
  };
}

async function enforceUploadLimit(
  scope: ImageOwnerScope,
  sessionUser: string | number | undefined,
  fileSize: number,
) {
  if (scope.kind === "project") {
    await checkProjectDataUsageLimitReachedAndAuth(
      Number(scope.projectId),
      sessionUser,
      fileSize,
    );
    return;
  }

  await checkUserDataUsageLimitReachedAndAuth(scope.userId, fileSize);
}

async function incrementOwnerDataUsage(
  scope: ImageOwnerScope,
  uploadedBytes: number,
) {
  if (scope.kind === "project") {
    const projectData = await getProjectQuery(scope.projectId);
    const project = projectData.rows[0];
    await editProjectQuery(project.id, {
      used_data_in_bytes: project.used_data_in_bytes + uploadedBytes,
    });
    return;
  }

  const userData = await getUserByIdQuery(scope.userId);
  const user = userData.rows[0];
  await editUserQuery(user.id, {
    used_data_in_bytes: user.used_data_in_bytes + uploadedBytes,
  });
}

function cacheImageSignedUrl(image: Image) {
  const signedUrl = generateSignedUrl(image.file_name);
  cacheSignedUrl(image.id, signedUrl);
  return signedUrl;
}

async function persistUploadedImage(
  req: Request,
  upload: PreparedUpload,
): Promise<{ image: Image; signedUrl: string }> {
  if (!req.file) throw new Error("Missing file");

  const params = computeAwsImageParamsFromRequest(req);
  const imageData = await addImageQuery({
    original_name: req.file.originalname,
    size: upload.fileSize,
    file_name: params.Key,
  });
  const image = imageData.rows[0];

  await uploadFileToS3(params, upload.filePath);

  return {
    image,
    signedUrl: cacheImageSignedUrl(image),
  };
}

function logImageUpload(
  req: Request,
  scope: ImageOwnerScope,
  image: Image,
) {
  logEventAsync({
    userId: req.session.user,
    projectId: scope.kind === "project" ? scope.projectId : undefined,
    eventType: EventType.IMAGE_UPLOADED,
    eventData: {
      imageId: image.id,
      fileName: image.original_name,
      fileSize: image.size,
    },
    req,
  });
}

async function uploadImageForScope(
  req: Request,
  scope: ImageOwnerScope,
  upload: PreparedUpload,
) {
  await enforceUploadLimit(scope, req.session.user, upload.fileSize);
  const { image, signedUrl } = await persistUploadedImage(req, upload);
  logImageUpload(req, scope, image);
  await incrementOwnerDataUsage(scope, image.size);
  return { image, signedUrl };
}

function cleanupTempUpload(filePath: string) {
  try {
    unlinkSync(filePath);
  } catch {
    // File may not exist if error occurred before creation
  }
}

async function getCachedOrFreshSignedUrl(image: Image) {
  const cacheKey = getSignedUrlCacheKey(image.id);
  const cachedUrl = await redisClient.get(cacheKey);
  if (cachedUrl) return cachedUrl;

  return cacheImageSignedUrl(image);
}

async function getAccessibleRecordsForImage(
  req: Request,
  imageId: string | number,
) {
  const recordImageData = await getRecordImagesByImageQuery(imageId);
  const recordsData = await Promise.all(
    recordImageData.rows.map(async (ri) => {
      const recordData = await getRecordQuery(ri.record_id);
      return recordData.rows[0];
    }),
  );

  const accessibleRecords: Record[] = [];
  for (const record of recordsData) {
    if (!record) continue;
    if (!req.session?.user) {
      if (record.is_public) accessibleRecords.push(record);
      continue;
    }
    try {
      await requireRecordViewAccess(req, record);
      accessibleRecords.push(record);
    } catch {
      // Intentionally ignore records the caller cannot access.
    }
  }

  return accessibleRecords;
}

async function unlinkImageForScope(
  imageId: string | number,
  scope: ImageOwnerScope,
) {
  if (scope.kind === "project") {
    await ensureImageLinkedToProject(imageId, scope.projectId);
    return await unlinkImageAndDeleteIfOrphaned({
      imageId,
      unlinkScope: {
        type: "project",
        projectId: scope.projectId,
      },
      ownerScope: {
        type: "project",
        projectId: scope.projectId,
      },
    });
  }

  await ensureImageLinkedToUser(imageId, scope.userId);
  return await unlinkImageAndDeleteIfOrphaned({
    imageId,
    unlinkScope: {
      type: "user",
      userId: scope.userId,
    },
    ownerScope: {
      type: "user",
      userId: scope.userId,
    },
  });
}

async function cleanupOrphanedImage(
  imageId: string | number,
  image: { file_name: string },
  orphaned: boolean,
) {
  if (!orphaned) return;

  await removeImageFromBucket("wyrld/images", image);
  invalidateSignedUrlCache(imageId).catch((err) =>
    logger.warn(
      { err, imageId },
      "Failed to invalidate signed URL cache",
    ),
  );
}

function logImageDeletion(
  req: Request,
  scope: ImageOwnerScope,
  image: Pick<Image, "id" | "original_name" | "size">,
) {
  logEventAsync({
    userId: req.session.user,
    projectId: scope.kind === "project" ? scope.projectId : undefined,
    eventType: EventType.IMAGE_DELETED,
    eventData: {
      imageId: image.id,
      fileName: image.original_name,
      fileSize: image.size,
    },
    req,
  });
}

async function removeImageForScope(
  req: Request,
  imageId: string | number,
  scope: ImageOwnerScope,
) {
  const { image, orphaned } = await unlinkImageForScope(imageId, scope);
  await cleanupOrphanedImage(imageId, image, orphaned);
  logImageDeletion(req, scope, image);
  return { image, orphaned };
}

async function clearProjectBannerImageIfRemoved(
  projectId: string | number,
  imageId: string | number,
) {
  const projectData = await getProjectQuery(projectId);
  const project = projectData.rows[0];
  if (String(project.image_id) !== String(imageId)) {
    return;
  }

  await editProjectQuery(project.id, {
    image_id: null,
  });
}

async function editImageMetadata(
  req: Request,
  imageId: string | number,
  patch: Partial<Pick<Image, "original_name" | "notes">>,
) {
  requireApiUser(req);
  await ensureImageEditableWithOptionalTableContext(req, imageId);
  const data = await editImageQuery(String(imageId), patch);
  return data.rows[0];
}

async function newImageForProject(
  req: NewImageForProjectRequestObject,
  res: Response,
  next: NextFunction,
) {
  if (!req.file) return next();

  let filePath = getTempUploadPath(req);

  try {
    const scope = await resolveProjectUploadScope(req);
    const upload = await prepareUpload(
      filePath,
      req.file.size,
      !!req.body.make_image_small,
    );
    filePath = upload.filePath;
    const { image, signedUrl } = await uploadImageForScope(req, scope, upload);
    res.send({ ...image, src: signedUrl });
  } catch (err) {
    return next(err);
  } finally {
    cleanupTempUpload(filePath);
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

  let filePath = getTempUploadPath(req);

  try {
    const scope = await resolveUserUploadScope(req);
    const upload = await prepareUpload(
      filePath,
      req.file.size,
      !!req.body.make_image_small,
    );
    filePath = upload.filePath;
    const { image, signedUrl } = await uploadImageForScope(req, scope, upload);
    res.send({ ...image, src: signedUrl });
  } catch (err) {
    return next(err);
  } finally {
    cleanupTempUpload(filePath);
  }
}

interface imageDataResObject extends Image {
  src: string;
  records: Record[];
}

async function getImage(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveImageViewScope(req);
    await ensureImageViewable(req, req.params.id, scope);

    const imageData = await getImageQuery(req.params.id);
    const image = getImageOrThrow(imageData) as imageDataResObject;
    image.src = await getCachedOrFreshSignedUrl(image);
    image.records = await getAccessibleRecordsForImage(req, image.id);
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
    await requireProjectEditorAccess(req, req.params.project_id);
    const tableAuth = await getOptionalTableAuthForImageMutation(req);
    if (tableAuth) {
      const tableProjectId = requireProjectIdFromTable(tableAuth.table);
      assertProjectIdMatchesTable(req.params.project_id, tableProjectId);
    }

    await removeImageForScope(req, req.params.image_id, {
      kind: "project",
      projectId: req.params.project_id,
    });
    await clearProjectBannerImageIfRemoved(
      req.params.project_id,
      req.params.image_id,
    );
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

    await removeImageForScope(req, req.params.image_id, {
      kind: "user",
      userId: tableUserId,
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
    const userId = requireApiUser(req);
    const tableAuth = await getOptionalTableAuthForImageMutation(req);
    if (tableAuth) {
      requireUserIdFromTable(tableAuth.table);
    }

    await removeImageForScope(req, req.params.image_id, {
      kind: "user",
      userId,
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
    const data = await editImageMetadata(req, req.params.id, {
      original_name: req.body.original_name,
    });
    res.status(200).send(data);
  } catch (err) {
    next(err);
  }
}

async function editImageNotes(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await editImageMetadata(req, req.params.id, {
      notes: req.body.notes,
    });
    res.status(200).send(data);
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
