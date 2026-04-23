import logger from "../../lib/logger.js";
import { removeImageFromBucket } from "./s3.js";
import { invalidateSignedUrlCache } from "./s3SignedUrls.js";

type DeletedImageAsset = {
  id: string | number;
  file_name: string;
};

export async function cleanupDeletedImageAssets(
  images: DeletedImageAsset[],
): Promise<void> {
  for (const image of images) {
    await removeImageFromBucket("wyrld/images", image);
    invalidateSignedUrlCache(image.id).catch((err) =>
      logger.warn(
        { err, imageId: image.id },
        "Failed to invalidate signed URL cache",
      ),
    );
  }
}
