export function getUploadFileKey(file) {
  const relative = String(
    file?.webkitRelativePath || file?.name || "",
  ).toLowerCase();
  const size = Number(file?.size || 0);
  const modified = Number(file?.lastModified || 0);
  return `${relative}|${size}|${modified}`;
}

export function dedupeUploadFiles(acceptedFiles, existingQueueItems = []) {
  const existing = new Set(
    (existingQueueItems || []).map((item) => getUploadFileKey(item?.file)),
  );

  const uniqueFiles = [];
  for (const file of acceptedFiles || []) {
    const key = getUploadFileKey(file);
    if (existing.has(key)) continue;
    existing.add(key);
    uniqueFiles.push(file);
  }

  return {
    uniqueFiles,
    duplicateCount: Math.max(0, (acceptedFiles || []).length - uniqueFiles.length),
  };
}
