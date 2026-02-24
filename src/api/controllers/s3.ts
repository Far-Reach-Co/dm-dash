import { unlinkSync } from "fs";
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
import { editUserQuery, getUserByIdQuery } from "../queries/users";
import {
  getRecordImagesByImageQuery,
} from "../queries/recordImage";
import { getRecordQuery, Record } from "../queries/record";
import { logEventAsync, EventType } from "../../lib/eventLogger";
import { redisClient } from "../../lib/socketUsers";
import logger from "../../lib/logger.js";
import { requireProjectEditor, requireUser } from "../../lib/authz";
import {
  assertProjectIdMatchesTable,
  requireProjectIdFromTable,
  requireTablePermissionById,
  requireUserIdFromTable,
} from "./tableResourceUtils";
import { requireRecordViewAccess } from "./accessControl";
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
    const urls = getSignedUrls(imageDataList.rows);
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
    } else {
      await requireProjectEditor(req, req.body.project_id);
    }

    const params = computeAwsImageParamsFromRequest(req);
    let fileSize = req.file.size;

    if (req.body.make_image_small) {
      const newFilePathFromResizedImage = await makeImageSmall(filePath);
      if (newFilePathFromResizedImage) {
        filePath = newFilePathFromResizedImage;
        fileSize = readFileSize(newFilePathFromResizedImage);
      }
    }
    await checkProjectDataUsageLimitReachedAndAuth(
      req.body.project_id,
      req.session.user,
      fileSize,
    );

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

    const params = computeAwsImageParamsFromRequest(req);
    let fileSize = req.file.size;

    if (req.body.make_image_small) {
      const newFilePathFromResizedImage = await makeImageSmall(filePath);
      if (newFilePathFromResizedImage) {
        filePath = newFilePathFromResizedImage;
        fileSize = readFileSize(newFilePathFromResizedImage);
      }
    }
    await checkUserDataUsageLimitReachedAndAuth(req.session.user, fileSize);

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
    const scope = await resolveImageViewScope(req);
    await ensureImageViewable(req, req.params.id, scope);

    const imageData = await getImageQuery(req.params.id);
    const image = getImageOrThrow(imageData) as imageDataResObject;

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
    image.records = accessibleRecords;
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
