import sharp from "sharp";
import logger from "./logger.js";

export async function getMetadata(imagePath: string) {
  try {
    return await sharp(imagePath).metadata();
  } catch (error) {
    logger.warn(
      { err: error, imagePath },
      "An error occurred during image metadata processing",
    );
    return null;
  }
}

export async function resizeImage(
  imagePath: string,
  width: number,
  height: number
) {
  try {
    width = Math.floor(width);
    height = Math.floor(height);

    const newPath = imagePath + "_resized";

    await sharp(imagePath)
      .resize({
        width,
        height,
      })
      .toFile(newPath);
    return newPath;
  } catch (error) {
    logger.warn({ err: error, imagePath }, "Failed to resize image");
    return null;
  }
}
