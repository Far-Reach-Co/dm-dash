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
exports.resizeImage = exports.getMetadata = void 0;
const sharp = require("sharp");
function getMetadata(imagePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield sharp(imagePath).metadata();
        }
        catch (error) {
            console.log(`An error occurred during processing image metadata: ${error}`);
            return null;
        }
    });
}
exports.getMetadata = getMetadata;
function resizeImage(imagePath, width, height) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            width = Math.floor(width);
            height = Math.floor(height);
            const newPath = imagePath + "_resized";
            yield sharp(imagePath)
                .resize({
                width,
                height,
            })
                .toFile(newPath);
            return newPath;
        }
        catch (error) {
            console.log(error);
            return null;
        }
    });
}
exports.resizeImage = resizeImage;
