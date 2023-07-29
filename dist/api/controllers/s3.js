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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.removeImageByTableUser = exports.removeImageByProject = exports.removeImage = exports.newImageForUser = exports.newImageForProject = exports.editImage = exports.getImage = exports.getSignedUrlForDownload = void 0;
var aws_sdk_1 = require("aws-sdk");
var fs_1 = require("fs");
var enums_js_1 = require("../../lib/enums.js");
var images_1 = require("../queries/images");
var projects_1 = require("../queries/projects");
var imageProcessing_js_1 = require("../../lib/imageProcessing.js");
var utils_js_1 = require("../../lib/utils.js");
var users_js_1 = require("../queries/users.js");
var tableViews_js_1 = require("../queries/tableViews.js");
aws_sdk_1.config.update({
    signatureVersion: "v4",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "us-east-1"
});
var s3 = new aws_sdk_1.S3();
function getSignedUrlForDownload(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var imageData, objectName, params_1, url, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4, (0, images_1.getImageQuery)(req.body.image_id)];
                case 1:
                    imageData = _a.sent();
                    objectName = imageData.rows[0].file_name;
                    params_1 = {
                        Bucket: "".concat(req.body.bucket_name, "/").concat(req.body.folder_name),
                        Key: objectName,
                        Expires: 60 * 60 * 24 * 3
                    };
                    return [4, new Promise(function (resolve, reject) {
                            s3.getSignedUrl("getObject", params_1, function (err, url) {
                                err ? reject(err) : resolve(url);
                            });
                        })];
                case 2:
                    url = _a.sent();
                    res.send({ url: url });
                    return [3, 4];
                case 3:
                    err_1 = _a.sent();
                    next(err_1);
                    return [3, 4];
                case 4: return [2];
            }
        });
    });
}
exports.getSignedUrlForDownload = getSignedUrlForDownload;
function computeAwsImageParamsFromRequest(req, filePath) {
    if (!req.file)
        throw new Error("Missing file");
    var name = req.file.originalname;
    var ind2 = name.lastIndexOf(".");
    var type = (0, utils_js_1.splitAtIndex)(name, ind2);
    var imageRef = req.file.filename + type[1];
    return {
        Bucket: "".concat(req.body.bucket_name, "/").concat(req.body.folder_name),
        Key: imageRef,
        Body: (0, fs_1.readFileSync)(filePath)
    };
}
function checkUserProLimitReached(sessionUser) {
    return __awaiter(this, void 0, void 0, function () {
        var userData, user, userDataCount, ONE_HUNDRED_MEGABYTES_IN_BYTES;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!sessionUser)
                        throw new Error("User is not logged in");
                    return [4, (0, users_js_1.getUserByIdQuery)(sessionUser)];
                case 1:
                    userData = _a.sent();
                    user = userData.rows[0];
                    userDataCount = user.used_data_in_bytes;
                    ONE_HUNDRED_MEGABYTES_IN_BYTES = 104857600;
                    if (userDataCount >= ONE_HUNDRED_MEGABYTES_IN_BYTES) {
                        if (!user.is_pro)
                            throw { status: 402, message: enums_js_1.userSubscriptionStatus.userIsNotPro };
                    }
                    return [2];
            }
        });
    });
}
function checkProjectProLimitReached(projectId) {
    return __awaiter(this, void 0, void 0, function () {
        var projectData, project, projectDataCount, ONE_HUNDRED_MEGABYTES_IN_BYTES, userData, projectUser;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!projectId)
                        throw new Error("Missing project ID");
                    return [4, (0, projects_1.getProjectQuery)(projectId)];
                case 1:
                    projectData = _a.sent();
                    project = projectData.rows[0];
                    projectDataCount = project.used_data_in_bytes;
                    ONE_HUNDRED_MEGABYTES_IN_BYTES = 104857600;
                    if (!(projectDataCount >= ONE_HUNDRED_MEGABYTES_IN_BYTES)) return [3, 3];
                    return [4, (0, users_js_1.getUserByIdQuery)(project.user_id)];
                case 2:
                    userData = _a.sent();
                    projectUser = userData.rows[0];
                    if (!projectUser.is_pro)
                        throw { status: 402, message: enums_js_1.userSubscriptionStatus.userIsNotPro };
                    _a.label = 3;
                case 3: return [2];
            }
        });
    });
}
function makeImageSmall(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var smallImageWidth, imageMetadata, aspectRatio, newFilePathFromResizedImage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    smallImageWidth = 100;
                    return [4, (0, imageProcessing_js_1.getMetadata)(filePath)];
                case 1:
                    imageMetadata = _a.sent();
                    if (!(imageMetadata &&
                        imageMetadata.height &&
                        imageMetadata.width &&
                        imageMetadata.width > smallImageWidth)) return [3, 3];
                    aspectRatio = imageMetadata.width / imageMetadata.height;
                    return [4, (0, imageProcessing_js_1.resizeImage)(filePath, smallImageWidth, smallImageWidth / aspectRatio)];
                case 2:
                    newFilePathFromResizedImage = _a.sent();
                    (0, fs_1.unlinkSync)(filePath);
                    return [2, newFilePathFromResizedImage];
                case 3: return [2, null];
            }
        });
    });
}
function newImageForProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var filePath, image, params_2, fileSize, newFilePathFromResizedImage, stats, fileSizeInBytes, imageData, err_2, dataUsageCount, oldImageData, oldImage, projectData, project, newCalculatedData, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!req.file)
                        return [2, next()];
                    filePath = "file_uploads/".concat(req.file.filename);
                    image = null;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    return [4, checkProjectProLimitReached(req.body.project_id)];
                case 2:
                    _a.sent();
                    params_2 = computeAwsImageParamsFromRequest(req, filePath);
                    fileSize = req.file.size;
                    if (!req.body.make_image_small) return [3, 4];
                    return [4, makeImageSmall(filePath)];
                case 3:
                    newFilePathFromResizedImage = _a.sent();
                    if (newFilePathFromResizedImage) {
                        filePath = newFilePathFromResizedImage;
                        params_2.Body = (0, fs_1.readFileSync)(newFilePathFromResizedImage);
                        stats = (0, fs_1.statSync)(newFilePathFromResizedImage);
                        fileSizeInBytes = stats.size;
                        fileSize = fileSizeInBytes;
                    }
                    _a.label = 4;
                case 4: return [4, (0, images_1.addImageQuery)({
                        original_name: req.file.originalname,
                        size: fileSize,
                        file_name: params_2.Key
                    })];
                case 5:
                    imageData = _a.sent();
                    image = imageData.rows[0];
                    return [4, new Promise(function (resolve, reject) {
                            s3.upload(params_2, function (err, data) {
                                if (err) {
                                    reject(err);
                                }
                                resolve(data.Location);
                            });
                        })];
                case 6:
                    _a.sent();
                    res.send(image);
                    return [3, 8];
                case 7:
                    err_2 = _a.sent();
                    (0, fs_1.unlinkSync)(filePath);
                    return [2, next(err_2)];
                case 8:
                    (0, fs_1.unlinkSync)(filePath);
                    _a.label = 9;
                case 9:
                    _a.trys.push([9, 16, , 17]);
                    dataUsageCount = 0;
                    dataUsageCount += image.size;
                    if (!req.body.current_file_id) return [3, 13];
                    return [4, (0, images_1.getImageQuery)(req.body.current_file_id)];
                case 10:
                    oldImageData = _a.sent();
                    oldImage = oldImageData.rows[0];
                    return [4, removeImage("".concat(req.body.bucket_name, "/").concat(req.body.folder_name), oldImage)];
                case 11:
                    _a.sent();
                    return [4, (0, images_1.removeImageQuery)(req.body.current_file_id)];
                case 12:
                    _a.sent();
                    dataUsageCount -= oldImage.size;
                    _a.label = 13;
                case 13: return [4, (0, projects_1.getProjectQuery)(req.body.project_id)];
                case 14:
                    projectData = _a.sent();
                    project = projectData.rows[0];
                    newCalculatedData = project.used_data_in_bytes + dataUsageCount;
                    return [4, (0, projects_1.editProjectQuery)(project.id, {
                            used_data_in_bytes: newCalculatedData
                        })];
                case 15:
                    _a.sent();
                    return [3, 17];
                case 16:
                    err_3 = _a.sent();
                    console.log(err_3);
                    next(err_3);
                    return [3, 17];
                case 17: return [2];
            }
        });
    });
}
exports.newImageForProject = newImageForProject;
function newImageForUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var filePath, image, params_3, fileSize, newFilePathFromResizedImage, stats, fileSizeInBytes, imageData, err_4, dataUsageCount, userData, user, newCalculatedData, err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!req.file)
                        return [2, next()];
                    filePath = "file_uploads/".concat(req.file.filename);
                    image = null;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    if (!req.session.user)
                        throw new Error("User is not logged in");
                    return [4, checkUserProLimitReached(req.session.user)];
                case 2:
                    _a.sent();
                    params_3 = computeAwsImageParamsFromRequest(req, filePath);
                    fileSize = req.file.size;
                    if (!req.body.make_image_small) return [3, 4];
                    return [4, makeImageSmall(filePath)];
                case 3:
                    newFilePathFromResizedImage = _a.sent();
                    if (newFilePathFromResizedImage) {
                        filePath = newFilePathFromResizedImage;
                        params_3.Body = (0, fs_1.readFileSync)(newFilePathFromResizedImage);
                        stats = (0, fs_1.statSync)(newFilePathFromResizedImage);
                        fileSizeInBytes = stats.size;
                        fileSize = fileSizeInBytes;
                    }
                    _a.label = 4;
                case 4: return [4, (0, images_1.addImageQuery)({
                        original_name: req.file.originalname,
                        size: fileSize,
                        file_name: params_3.Key
                    })];
                case 5:
                    imageData = _a.sent();
                    image = imageData.rows[0];
                    return [4, new Promise(function (resolve, reject) {
                            s3.upload(params_3, function (err, data) {
                                if (err) {
                                    reject(err);
                                }
                                resolve(data.Location);
                            });
                        })];
                case 6:
                    _a.sent();
                    res.send(image);
                    return [3, 8];
                case 7:
                    err_4 = _a.sent();
                    (0, fs_1.unlinkSync)(filePath);
                    return [2, next(err_4)];
                case 8:
                    (0, fs_1.unlinkSync)(filePath);
                    _a.label = 9;
                case 9:
                    _a.trys.push([9, 12, , 13]);
                    dataUsageCount = 0;
                    dataUsageCount += image.size;
                    return [4, (0, users_js_1.getUserByIdQuery)(req.session.user)];
                case 10:
                    userData = _a.sent();
                    user = userData.rows[0];
                    newCalculatedData = user.used_data_in_bytes + dataUsageCount;
                    return [4, (0, users_js_1.editUserQuery)(user.id, {
                            used_data_in_bytes: newCalculatedData
                        })];
                case 11:
                    _a.sent();
                    return [3, 13];
                case 12:
                    err_5 = _a.sent();
                    console.log(err_5);
                    next(err_5);
                    return [3, 13];
                case 13: return [2];
            }
        });
    });
}
exports.newImageForUser = newImageForUser;
function getImage(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var imageData, err_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, (0, images_1.getImageQuery)(req.params.id)];
                case 1:
                    imageData = _a.sent();
                    res.send(imageData.rows[0]);
                    return [3, 3];
                case 2:
                    err_6 = _a.sent();
                    console.log(err_6);
                    next(err_6);
                    return [3, 3];
                case 3: return [2];
            }
        });
    });
}
exports.getImage = getImage;
function removeImageByProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var imageData, image, projectData, project, newCalculatedData, err_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [4, (0, images_1.getImageQuery)(req.params.image_id)];
                case 1:
                    imageData = _a.sent();
                    image = imageData.rows[0];
                    return [4, removeImage("wyrld/images", image)];
                case 2:
                    _a.sent();
                    return [4, (0, images_1.removeImageQuery)(req.params.image_id)];
                case 3:
                    _a.sent();
                    return [4, (0, projects_1.getProjectQuery)(req.params.project_id)];
                case 4:
                    projectData = _a.sent();
                    project = projectData.rows[0];
                    newCalculatedData = project.used_data_in_bytes - image.size;
                    return [4, (0, projects_1.editProjectQuery)(project.id, {
                            used_data_in_bytes: newCalculatedData
                        })];
                case 5:
                    _a.sent();
                    res.status(204).send();
                    return [3, 7];
                case 6:
                    err_7 = _a.sent();
                    console.log(err_7);
                    next(err_7);
                    return [3, 7];
                case 7: return [2];
            }
        });
    });
}
exports.removeImageByProject = removeImageByProject;
function removeImageByTableUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var imageData, image, tableData, table, userData, user, newCalculatedData, err_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    return [4, (0, images_1.getImageQuery)(req.params.image_id)];
                case 1:
                    imageData = _a.sent();
                    image = imageData.rows[0];
                    return [4, removeImage("wyrld/images", image)];
                case 2:
                    _a.sent();
                    return [4, (0, images_1.removeImageQuery)(req.params.image_id)];
                case 3:
                    _a.sent();
                    return [4, (0, tableViews_js_1.getTableViewQuery)(req.params.table_id)];
                case 4:
                    tableData = _a.sent();
                    table = tableData.rows[0];
                    return [4, (0, users_js_1.getUserByIdQuery)(table.user_id)];
                case 5:
                    userData = _a.sent();
                    user = userData.rows[0];
                    newCalculatedData = user.used_data_in_bytes - image.size;
                    return [4, (0, users_js_1.editUserQuery)(user.id, {
                            used_data_in_bytes: newCalculatedData
                        })];
                case 6:
                    _a.sent();
                    res.status(204).send();
                    return [3, 8];
                case 7:
                    err_8 = _a.sent();
                    console.log(err_8);
                    next(err_8);
                    return [3, 8];
                case 8: return [2];
            }
        });
    });
}
exports.removeImageByTableUser = removeImageByTableUser;
function removeImage(bucket, image) {
    return __awaiter(this, void 0, void 0, function () {
        var params_4, err_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    params_4 = {
                        Bucket: bucket,
                        Key: image.file_name
                    };
                    return [4, new Promise(function (resolve, reject) {
                            s3.deleteObject(params_4, function (err, data) {
                                if (err) {
                                    reject(err);
                                }
                                resolve(data.DeleteMarker);
                            });
                        })];
                case 1:
                    _a.sent();
                    return [3, 3];
                case 2:
                    err_9 = _a.sent();
                    console.log(err_9);
                    return [3, 3];
                case 3: return [2];
            }
        });
    });
}
exports.removeImage = removeImage;
function editImage(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var data, err_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, (0, images_1.editImageQuery)(req.params.id, req.body)];
                case 1:
                    data = _a.sent();
                    res.status(200).send(data.rows[0]);
                    return [3, 3];
                case 2:
                    err_10 = _a.sent();
                    next(err_10);
                    return [3, 3];
                case 3: return [2];
            }
        });
    });
}
exports.editImage = editImage;
