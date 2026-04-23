import { pool } from "../api/dbconfig";
import type { PoolClient } from "pg";

export type ImageScope =
  | { type: "project"; projectId: string | number }
  | { type: "user"; userId: string | number };

type ImageLifecycleOwnerScope =
  | { type: "project"; projectId: string | number }
  | { type: "user"; userId: string | number };

type QueryClient = {
  query: PoolClient["query"];
};

export interface ImageReferenceCounts {
  tableImageCount: number;
  recordImageCount: number;
  libraryPackImageCount: number;
  total: number;
}

export interface UnlinkImageResult {
  image: {
    id: number;
    original_name: string;
    size: number;
    file_name: string;
  };
  orphaned: boolean;
  removedLinks: number;
}

export interface DeletedOrphanImage {
  id: number;
  original_name: string;
  size: number;
  file_name: string;
}

let hasLibraryPackImageTable: boolean | null = null;

async function resolveHasLibraryPackImageTable(client: QueryClient) {
  if (hasLibraryPackImageTable !== null) return hasLibraryPackImageTable;
  const result = await client.query<{ regclass: string | null }>(
    `select to_regclass('public."LibraryPackImage"')::text as regclass`,
  );
  hasLibraryPackImageTable = !!result.rows[0]?.regclass;
  return hasLibraryPackImageTable;
}

async function getLibraryPackImageReferenceCount(
  imageId: string | number,
  client: QueryClient,
) {
  const hasTable = await resolveHasLibraryPackImageTable(client);
  if (!hasTable) return 0;

  const result = await client.query<{ count: string }>(
    `select count(*)::text as count from public."LibraryPackImage" where image_id = $1`,
    [imageId],
  );
  return Number(result.rows[0]?.count || 0);
}

export async function getImageReferenceCounts(
  imageId: string | number,
  client: QueryClient = pool,
): Promise<ImageReferenceCounts> {
  const [tableImageCountResult, recordImageCountResult, libraryPackImageCount] =
    await Promise.all([
      client.query<{ count: string }>(
        `select count(*)::text as count from public."TableImage" where image_id = $1`,
        [imageId],
      ),
      client.query<{ count: string }>(
        `select count(*)::text as count from public."RecordImage" where image_id = $1`,
        [imageId],
      ),
      getLibraryPackImageReferenceCount(imageId, client),
    ]);

  const tableImageCount = Number(tableImageCountResult.rows[0]?.count || 0);
  const recordImageCount = Number(recordImageCountResult.rows[0]?.count || 0);
  const total = tableImageCount + recordImageCount + libraryPackImageCount;

  return {
    tableImageCount,
    recordImageCount,
    libraryPackImageCount,
    total,
  };
}

export async function isImageOrphaned(
  imageId: string | number,
  client: QueryClient = pool,
) {
  const refs = await getImageReferenceCounts(imageId, client);
  return refs.total === 0;
}

export async function unlinkImageFromScope(
  imageId: string | number,
  scope: ImageScope,
  client: QueryClient = pool,
) {
  if (scope.type === "project") {
    const data = await client.query(
      `delete from public."TableImage" where project_id = $1 and image_id = $2 returning id`,
      [scope.projectId, imageId],
    );
    return data.rowCount || 0;
  }

  const data = await client.query(
    `delete from public."TableImage" where user_id = $1 and image_id = $2 returning id`,
    [scope.userId, imageId],
  );
  return data.rowCount || 0;
}

async function updateOwnerUsageIfNeeded(
  ownerScope: ImageLifecycleOwnerScope,
  size: number,
  client: QueryClient,
) {
  if (ownerScope.type === "project") {
    await client.query(
      `update public."Project"
       set used_data_in_bytes = greatest(0, coalesce(used_data_in_bytes, 0) - $2)
       where id = $1`,
      [ownerScope.projectId, size],
    );
    return;
  }

  await client.query(
    `update public."User"
     set used_data_in_bytes = greatest(0, coalesce(used_data_in_bytes, 0) - $2)
     where id = $1`,
    [ownerScope.userId, size],
  );
}

function normalizeImageIds(imageIds: Array<string | number>) {
  const normalized = imageIds
    .map((imageId) => Number(imageId))
    .filter((imageId) => Number.isInteger(imageId) && imageId > 0);
  return [...new Set(normalized)];
}

export async function deleteImagesIfOrphaned(params: {
  imageIds: Array<string | number>;
  ownerScope?: ImageLifecycleOwnerScope | null;
}): Promise<DeletedOrphanImage[]> {
  const imageIds = normalizeImageIds(params.imageIds);
  if (!imageIds.length) return [];

  const client = await pool.connect();
  try {
    await client.query("begin");
    const deletedImages: DeletedOrphanImage[] = [];

    for (const imageId of imageIds) {
      const imageData = await client.query<DeletedOrphanImage>(
        `select id, original_name, size, file_name
         from public."Image"
         where id = $1 and is_blocked = false
         for update`,
        [imageId],
      );
      const image = imageData.rows[0];
      if (!image) continue;

      const orphaned = await isImageOrphaned(imageId, client);
      if (!orphaned) continue;

      await client.query(`delete from public."Image" where id = $1`, [imageId]);
      if (params.ownerScope) {
        await updateOwnerUsageIfNeeded(params.ownerScope, image.size, client);
      }
      deletedImages.push(image);
    }

    await client.query("commit");
    return deletedImages;
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }
}

export async function unlinkImageAndDeleteIfOrphaned(params: {
  imageId: string | number;
  unlinkScope: ImageScope;
  ownerScope: ImageLifecycleOwnerScope;
}): Promise<UnlinkImageResult> {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const imageData = await client.query<{
      id: number;
      original_name: string;
      size: number;
      file_name: string;
    }>(
      `select id, original_name, size, file_name
       from public."Image"
       where id = $1 and is_blocked = false
       for update`,
      [params.imageId],
    );
    const image = imageData.rows[0];
    if (!image) {
      throw { status: 404, message: "Image not found" };
    }

    const removedLinks = await unlinkImageFromScope(
      params.imageId,
      params.unlinkScope,
      client,
    );
    if (!removedLinks) {
      throw { status: 404, message: "Image not found in this scope" };
    }

    const orphaned = await isImageOrphaned(params.imageId, client);
    if (orphaned) {
      await client.query(`delete from public."Image" where id = $1`, [params.imageId]);
      await updateOwnerUsageIfNeeded(params.ownerScope, image.size, client);
    }

    await client.query("commit");
    return {
      image,
      orphaned,
      removedLinks,
    };
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }
}
