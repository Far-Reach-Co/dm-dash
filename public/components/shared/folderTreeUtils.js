export const buildFolderTree = (folders) => {
  const map = {};
  const roots = [];
  for (const f of folders) {
    map[f.id] = { ...f, children: [] };
  }
  for (const f of folders) {
    if (f.parent_folder_id && map[f.parent_folder_id]) {
      map[f.parent_folder_id].children.push(map[f.id]);
    } else if (!f.parent_folder_id) {
      roots.push(map[f.id]);
    }
  }
  return roots;
};

export const buildCountsFromImages = (images) => {
  const by_folder = {};
  let total = 0;
  let unsorted = 0;

  for (const img of images) {
    total += 1;
    if (img.folder_id) {
      const key = String(img.folder_id);
      by_folder[key] = (by_folder[key] || 0) + 1;
    } else {
      unsorted += 1;
    }
  }

  return { total, unsorted, by_folder };
};
