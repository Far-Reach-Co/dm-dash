export function getCanvasObjects(tableView) {
  return Array.isArray(tableView?.data?.objects) ? tableView.data.objects : [];
}

export function hasCanvasObjects(tableView) {
  return getCanvasObjects(tableView).length > 0;
}

export function getCanvasImageIds(objects) {
  return [
    ...new Set(
      (objects || [])
        .filter((object) => Boolean(object?.imageId))
        .map((object) => object.imageId),
    ),
  ];
}

export function hydrateCanvasImageSources(objects, presignedUrls) {
  const urlMap = presignedUrls?.urls || {};
  for (const object of objects || []) {
    if (!object?.imageId) continue;
    if (urlMap[object.imageId]) {
      object.src = urlMap[object.imageId];
    }
  }
}
