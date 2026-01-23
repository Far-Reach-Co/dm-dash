"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editImageNotes = exports.removeImageByTableUser = exports.removeImageByProject = exports.removeImageFromBucket = exports.newImageForUser = exports.newImageForProject = exports.editImageName = exports.getImage = exports.getSignedUrlsHandler = exports.getSignedUrls = void 0;
const aws_sdk_1 = require("aws-sdk");
const fs_1 = require("fs");
const enums_1 = require("../../lib/enums");
const images_1 = require("../queries/images");
const projects_1 = require("../queries/projects");
const imageProcessing_1 = require("../../lib/imageProcessing");
const utils_1 = require("../../lib/utils");
const users_1 = require("../queries/users");
const tableViews_js_1 = require("../queries/tableViews.js");
const projectUsers_1 = require("../queries/projectUsers");
const path = require("path");
const fs = require("fs");
const enums_2 = require("../../lib/enums");
const recordImage_1 = require("../queries/recordImage");
const record_1 = require("../queries/record");
const eventLogger_1 = require("../../lib/eventLogger");
const socketUsers_1 = require("../../lib/socketUsers");
aws_sdk_1.config.update({
    signatureVersion: "v4",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "us-east-1",
});
const s3 = new aws_sdk_1.S3();
const cloudFrontPrivateKeyPath = path.join(__dirname, "..", "..", "..", "private_frc_cloudfront_key.pem");
const cloudFrontPrivateKey = fs.readFileSync(cloudFrontPrivateKeyPath, "utf8");
const cloudFrontKeyId = process.env.CLOUDFRONT_KEY_ID;
const cloudFrontSigner = new aws_sdk_1.CloudFront.Signer(cloudFrontKeyId, cloudFrontPrivateKey);
const SIGNED_URL_CACHE_TTL_SECONDS = 60 * 60 * 24 * 2.5;
const SIGNED_URL_CACHE_PREFIX = "signed_url:";
function getSignedUrlCacheKey(imageId) {
    return `${SIGNED_URL_CACHE_PREFIX}${imageId}`;
}
function invalidateSignedUrlCache(imageId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield socketUsers_1.redisClient.del(getSignedUrlCacheKey(imageId));
    });
}
function getSignedUrlsHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.body.image_ids.length)
                return res.send([]);
            const imageDataList = yield (0, images_1.getImagesQuery)(req.body.image_ids);
            const urls = getSignedUrls(imageDataList.rows);
            return res.send({ urls });
        }
        catch (err) {
            return next(err);
        }
    });
}
exports.getSignedUrlsHandler = getSignedUrlsHandler;
function getSignedUrls(images) {
    return __awaiter(this, void 0, void 0, function* () {
        const urls = {};
        const uncachedImages = [];
        for (const imageData of images) {
            const cacheKey = getSignedUrlCacheKey(imageData.id);
            const cachedUrl = yield socketUsers_1.redisClient.get(cacheKey);
            if (cachedUrl) {
                urls[imageData.id] = cachedUrl;
            }
            else {
                const cloudFrontUrl = `https://${process.env.CLOUDFRONT_DISTRIBUTION_DOMAIN}/images/${imageData.file_name}`;
                const expiresAt = Math.floor((Date.now() + 60 * 60 * 24 * 3 * 1000) / 1000);
                const signedUrl = cloudFrontSigner.getSignedUrl({
                    url: cloudFrontUrl,
                    expires: expiresAt,
                });
                urls[imageData.id] = signedUrl;
                uncachedImages.push({ id: imageData.id, url: signedUrl });
            }
        }
        if (uncachedImages.length > 0) {
            Promise.all(uncachedImages.map(({ id, url }) => socketUsers_1.redisClient.setEx(getSignedUrlCacheKey(id), SIGNED_URL_CACHE_TTL_SECONDS, url))).catch((err) => console.error("Failed to cache signed URLs:", err));
        }
        return urls;
    });
}
exports.getSignedUrls = getSignedUrls;
function computeAwsImageParamsFromRequest(req, filePath) {
    if (!req.file)
        throw new Error("Missing file");
    const name = req.file.originalname;
    var ind2 = name.lastIndexOf(".");
    const type = (0, utils_1.splitAtIndex)(name, ind2);
    const imageRef = req.file.filename + type[1];
    return {
        Bucket: `${req.body.bucket_name}/${req.body.folder_name}`,
        Key: imageRef,
        Body: (0, fs_1.readFileSync)(filePath),
    };
}
function checkUserProLimitReachedAndAuth(sessionUser) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!sessionUser)
            throw new Error("User is not logged in");
        const userData = yield (0, users_1.getUserByIdQuery)(sessionUser);
        const user = userData.rows[0];
        const userDataCount = user.used_data_in_bytes;
        if (userDataCount >= enums_2.megabytesInBytes.oneHundred) {
            if (!user.is_pro)
                throw { status: 402, message: enums_1.userSubscriptionStatus.userIsNotPro };
        }
    });
}
function checkProjectProLimitReachedAndAuth(projectId, sessionUser) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!sessionUser)
            throw new Error("User is not logged in");
        if (!projectId)
            throw new Error("Missing project ID");
        const projectData = yield (0, projects_1.getProjectQuery)(projectId);
        const project = projectData.rows[0];
        if (sessionUser != project.user_id) {
            const projectUserData = yield (0, projectUsers_1.getProjectUserByUserAndProjectQuery)(sessionUser, projectId);
            if (!projectUserData.rows.length)
                throw new Error("Not authorized to update this resource");
        }
        const projectDataCount = project.used_data_in_bytes;
        if (projectDataCount >= enums_2.megabytesInBytes.oneHundred) {
            if (!project.is_pro) {
                throw { status: 402, message: enums_1.userSubscriptionStatus.projectIsNotPro };
            }
        }
    });
}
function makeImageSmall(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const smallImageWidth = 100;
        const imageMetadata = yield (0, imageProcessing_1.getMetadata)(filePath);
        if (imageMetadata &&
            imageMetadata.height &&
            imageMetadata.width &&
            imageMetadata.width > smallImageWidth) {
            const aspectRatio = imageMetadata.width / imageMetadata.height;
            const newFilePathFromResizedImage = yield (0, imageProcessing_1.resizeImage)(filePath, smallImageWidth, smallImageWidth / aspectRatio);
            (0, fs_1.unlinkSync)(filePath);
            return newFilePathFromResizedImage;
        }
        else
            return null;
    });
}
function newImageForProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!req.file)
            return next();
        let filePath = `file_uploads/${req.file.filename}`;
        let image = null;
        try {
            yield checkProjectProLimitReachedAndAuth(req.body.project_id, req.session.user);
            const params = computeAwsImageParamsFromRequest(req, filePath);
            let fileSize = req.file.size;
            if (req.body.make_image_small) {
                const newFilePathFromResizedImage = yield makeImageSmall(filePath);
                if (newFilePathFromResizedImage) {
                    filePath = newFilePathFromResizedImage;
                    params.Body = (0, fs_1.readFileSync)(newFilePathFromResizedImage);
                    const stats = (0, fs_1.statSync)(newFilePathFromResizedImage);
                    const fileSizeInBytes = stats.size;
                    fileSize = fileSizeInBytes;
                }
            }
            const imageData = yield (0, images_1.addImageQuery)({
                original_name: req.file.originalname,
                size: fileSize,
                file_name: params.Key,
            });
            image = imageData.rows[0];
            yield new Promise((resolve, reject) => {
                s3.upload(params, (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(data.Location);
                });
            });
            (0, eventLogger_1.logEventAsync)({
                userId: req.session.user,
                projectId: req.body.project_id,
                eventType: eventLogger_1.EventType.IMAGE_UPLOADED,
                eventData: {
                    imageId: image.id,
                    fileName: image.original_name,
                    fileSize: image.size,
                },
                req,
            });
            res.send(image);
        }
        catch (err) {
            (0, fs_1.unlinkSync)(filePath);
            return next(err);
        }
        (0, fs_1.unlinkSync)(filePath);
        try {
            let dataUsageCount = 0;
            dataUsageCount += image.size;
            if (req.body.current_file_id) {
                const oldImageData = yield (0, images_1.getImageQuery)(req.body.current_file_id);
                const oldImage = oldImageData.rows[0];
                yield removeImageFromBucket(`${req.body.bucket_name}/${req.body.folder_name}`, oldImage);
                yield (0, images_1.removeImageQuery)(req.body.current_file_id);
                invalidateSignedUrlCache(req.body.current_file_id).catch((err) => console.error("Failed to invalidate signed URL cache:", err));
                dataUsageCount -= oldImage.size;
            }
            const projectData = yield (0, projects_1.getProjectQuery)(req.body.project_id);
            const project = projectData.rows[0];
            const newCalculatedData = project.used_data_in_bytes + dataUsageCount;
            yield (0, projects_1.editProjectQuery)(project.id, {
                used_data_in_bytes: newCalculatedData,
            });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.newImageForProject = newImageForProject;
function newImageForUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!req.file)
            return next();
        let filePath = `file_uploads/${req.file.filename}`;
        let image = null;
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            yield checkUserProLimitReachedAndAuth(req.session.user);
            const params = computeAwsImageParamsFromRequest(req, filePath);
            let fileSize = req.file.size;
            if (req.body.make_image_small) {
                const newFilePathFromResizedImage = yield makeImageSmall(filePath);
                if (newFilePathFromResizedImage) {
                    filePath = newFilePathFromResizedImage;
                    params.Body = (0, fs_1.readFileSync)(newFilePathFromResizedImage);
                    const stats = (0, fs_1.statSync)(newFilePathFromResizedImage);
                    const fileSizeInBytes = stats.size;
                    fileSize = fileSizeInBytes;
                }
            }
            const imageData = yield (0, images_1.addImageQuery)({
                original_name: req.file.originalname,
                size: fileSize,
                file_name: params.Key,
            });
            image = imageData.rows[0];
            yield new Promise((resolve, reject) => {
                s3.upload(params, (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(data.Location);
                });
            });
            (0, eventLogger_1.logEventAsync)({
                userId: req.session.user,
                eventType: eventLogger_1.EventType.IMAGE_UPLOADED,
                eventData: {
                    imageId: image.id,
                    fileName: image.original_name,
                    fileSize: image.size,
                },
                req,
            });
            res.send(image);
        }
        catch (err) {
            (0, fs_1.unlinkSync)(filePath);
            return next(err);
        }
        (0, fs_1.unlinkSync)(filePath);
        try {
            let dataUsageCount = 0;
            dataUsageCount += image.size;
            const userData = yield (0, users_1.getUserByIdQuery)(req.session.user);
            const user = userData.rows[0];
            const newCalculatedData = user.used_data_in_bytes + dataUsageCount;
            yield (0, users_1.editUserQuery)(user.id, {
                used_data_in_bytes: newCalculatedData,
            });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.newImageForUser = newImageForUser;
function getImage(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const imageData = yield (0, images_1.getImageQuery)(req.params.id);
            const image = imageData.rows[0];
            const cacheKey = getSignedUrlCacheKey(image.id);
            const cachedUrl = yield socketUsers_1.redisClient.get(cacheKey);
            if (cachedUrl) {
                image.src = cachedUrl;
            }
            else {
                const cloudFrontUrl = `https://${process.env.CLOUDFRONT_DISTRIBUTION_DOMAIN}/images/${image.file_name}`;
                const expiresAt = Math.floor((Date.now() + 60 * 60 * 24 * 3 * 1000) / 1000);
                image.src = cloudFrontSigner.getSignedUrl({
                    url: cloudFrontUrl,
                    expires: expiresAt,
                });
                socketUsers_1.redisClient
                    .setEx(cacheKey, SIGNED_URL_CACHE_TTL_SECONDS, image.src)
                    .catch((err) => console.error("Failed to cache signed URL:", err));
            }
            const recordImageData = yield (0, recordImage_1.getRecordImagesByImageQuery)(image.id);
            const recordsData = yield Promise.all(recordImageData.rows.map((ri) => __awaiter(this, void 0, void 0, function* () {
                const recordData = yield (0, record_1.getRecordQuery)(ri.record_id);
                const record = recordData.rows[0];
                return record;
            })));
            image.records = recordsData;
            res.send(image);
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.getImage = getImage;
function removeImageByProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const imageData = yield (0, images_1.getImageQuery)(req.params.image_id);
            const image = imageData.rows[0];
            yield removeImageFromBucket("wyrld/images", image);
            yield (0, images_1.removeImageQuery)(req.params.image_id);
            invalidateSignedUrlCache(req.params.image_id).catch((err) => console.error("Failed to invalidate signed URL cache:", err));
            const projectData = yield (0, projects_1.getProjectQuery)(req.params.project_id);
            const project = projectData.rows[0];
            const newCalculatedData = project.used_data_in_bytes - image.size;
            yield (0, projects_1.editProjectQuery)(project.id, {
                used_data_in_bytes: newCalculatedData,
            });
            (0, eventLogger_1.logEventAsync)({
                userId: req.session.user,
                projectId: req.params.project_id,
                eventType: eventLogger_1.EventType.IMAGE_DELETED,
                eventData: {
                    imageId: req.params.image_id,
                    fileName: image.original_name,
                    fileSize: image.size,
                },
                req,
            });
            res.status(204).send();
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.removeImageByProject = removeImageByProject;
function removeImageByTableUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const imageData = yield (0, images_1.getImageQuery)(req.params.image_id);
            const image = imageData.rows[0];
            yield removeImageFromBucket("wyrld/images", image);
            yield (0, images_1.removeImageQuery)(req.params.image_id);
            invalidateSignedUrlCache(req.params.image_id).catch((err) => console.error("Failed to invalidate signed URL cache:", err));
            const tableData = yield (0, tableViews_js_1.getTableViewQuery)(req.params.table_id);
            const table = tableData.rows[0];
            const userData = yield (0, users_1.getUserByIdQuery)(table.user_id);
            const user = userData.rows[0];
            const newCalculatedData = user.used_data_in_bytes - image.size;
            yield (0, users_1.editUserQuery)(user.id, {
                used_data_in_bytes: newCalculatedData,
            });
            (0, eventLogger_1.logEventAsync)({
                userId: req.session.user,
                eventType: eventLogger_1.EventType.IMAGE_DELETED,
                eventData: {
                    imageId: req.params.image_id,
                    fileName: image.original_name,
                    fileSize: image.size,
                },
                req,
            });
            res.status(204).send();
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.removeImageByTableUser = removeImageByTableUser;
function removeImageFromBucket(bucket, image) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const params = {
                Bucket: bucket,
                Key: image.file_name,
            };
            yield new Promise((resolve, reject) => {
                s3.deleteObject(params, (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(data.DeleteMarker);
                });
            });
        }
        catch (err) {
            console.log(err);
        }
    });
}
exports.removeImageFromBucket = removeImageFromBucket;
function editImageName(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, images_1.editImageQuery)(req.params.id, {
                original_name: req.body.original_name,
            });
            res.status(200).send(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.editImageName = editImageName;
function editImageNotes(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, images_1.editImageQuery)(req.params.id, {
                notes: req.body.notes,
            });
            res.status(200).send(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.editImageNotes = editImageNotes;
