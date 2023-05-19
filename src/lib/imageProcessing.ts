import sharp = require("sharp");

export async function getMetadata(imagePath: string) {
  try {
    return await sharp(imagePath).metadata();
  } catch (error) {
    console.log(`An error occurred during processing image metadata: ${error}`);
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
    console.log(error);
    return null;
  }
}
