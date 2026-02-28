export async function filterFabricCompatibleImageFiles(files) {
  const MAX_DECODE_CONCURRENCY = 6;
  const allowedExtensions = new Set([
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "bmp",
    "avif",
    "svg",
  ]);
  const blockedExtensions = new Set([
    "aae",
    "xmp",
    "json",
    "db",
    "ini",
    "tmp",
    "ds_store",
  ]);
  const blockedNames = new Set([
    ".ds_store",
    "thumbs.db",
    "desktop.ini",
  ]);

  const getExtension = (name) => {
    const parts = String(name || "").toLowerCase().split(".");
    return parts.length > 1 ? parts[parts.length - 1] : "";
  };

  const isBlockedFile = (file) => {
    const fileName = String(file?.name || "");
    const lowerName = fileName.toLowerCase();
    const ext = getExtension(fileName);
    const mime = String(file?.type || "").toLowerCase();
    const path = String(file?.webkitRelativePath || "").toLowerCase();

    if (lowerName.startsWith(".") || lowerName.startsWith("._")) return true;
    if (
      path.includes("/.") ||
      path.includes("/._") ||
      path.includes("\\.") ||
      path.includes("\\._")
    ) {
      return true;
    }
    if (blockedNames.has(lowerName)) return true;
    if (blockedExtensions.has(ext)) return true;
    if (!allowedExtensions.has(ext)) return true;
    if (mime && !mime.startsWith("image/")) return true;
    return false;
  };

  const canDecodeImageFile = async (file) => {
    const objectUrl = URL.createObjectURL(file);
    try {
      if (typeof createImageBitmap === "function") {
        try {
          const bitmap = await createImageBitmap(file);
          bitmap.close();
          return true;
        } catch {
          // Fallback to <img> decode for browser/Fabric parity.
        }
      }
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => reject(new Error("decode_failed"));
        img.src = objectUrl;
      });
      return true;
    } catch {
      return false;
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  };

  const sourceFiles = Array.from(files || []);
  const preAccepted = sourceFiles.filter((file) => !isBlockedFile(file));
  const decodeResults = new Array(preAccepted.length);
  let decodeIndex = 0;
  const workerCount = Math.min(MAX_DECODE_CONCURRENCY, preAccepted.length);
  const workers = Array.from({ length: workerCount }, async () => {
    while (decodeIndex < preAccepted.length) {
      const currentIndex = decodeIndex;
      decodeIndex += 1;
      const file = preAccepted[currentIndex];
      decodeResults[currentIndex] = {
        file,
        decodes: await canDecodeImageFile(file),
      };
    }
  });
  await Promise.all(workers);
  const accepted = decodeResults
    .filter((entry) => entry.decodes)
    .map((entry) => entry.file);
  const skipped = sourceFiles.length - accepted.length;

  return { accepted, skipped };
}
