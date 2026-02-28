import renderTierLimitWarning from "../components/renderTierLimitWarning.js";
import toast from "../components/Toast.js";

export async function getPresignedUrlsForImages(
  imageIds,
  { tableViewId = null, guestUuid = null } = {}
) {
  try {
    const payload = {
      image_ids: imageIds,
    };
    if (tableViewId) payload.table_view_id = tableViewId;
    if (guestUuid) payload.guest_uuid = guestUuid;

    const res = await fetch(`${window.origin}/api/signed_URL_download_multi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data) return data;
    else throw new Error();
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function uploadProjectImage(
  image,
  currentProjectId,
  makeImageSmall,
  tableViewId = null,
) {
  return await uploadImageWithContext({
    image,
    projectId: currentProjectId,
    tableViewId,
    makeImageSmall,
  });
}

export async function uploadUserImage(image, makeImageSmall, tableViewId = null) {
  return await uploadImageWithContext({
    image,
    makeImageSmall,
    tableViewId,
  });
}

export async function uploadImageWithContext({
  image,
  projectId = null,
  makeImageSmall = false,
  tableViewId = null,
  signal = null,
}) {
  try {
    const formData = new FormData();
    formData.append("file", image);
    formData.append("bucket_name", "wyrld");
    formData.append("folder_name", "images");
    if (projectId) formData.append("project_id", projectId);
    if (tableViewId) formData.append("table_view_id", tableViewId);
    if (makeImageSmall) formData.append("make_image_small", makeImageSmall);

    const endpoint = projectId ? "new_image_for_project" : "new_image_for_user";
    const res = await fetch(`${window.origin}/api/${endpoint}`, {
      method: "POST",
      body: formData,
      ...(signal ? { signal } : {}),
    });
    const data = await res.json();

    if (projectId) {
      if (res.status === 402 && data?.error?.message === "PROJECT_IS_NOT_PRO") {
        renderTierLimitWarning(
          'You have reached the free image data limit for this Wyrld. Upgrade to "Pro Wyrld" to increase storage.'
        );
        return null;
      }
      if (
        res.status === 413 &&
        data?.error?.message === "PROJECT_DATA_HARD_LIMIT_REACHED"
      ) {
        renderTierLimitWarning(
          "This Wyrld is at its hard image data cap. Remove unused images to free space."
        );
        return null;
      }
    } else {
      if (res.status === 402 && data?.error?.message === "USER_IS_NOT_PRO") {
        renderTierLimitWarning(
          'You have reached the free image data limit for this account. Upgrade to "Pro User" to increase storage.'
        );
        return null;
      }
      if (res.status === 413 && data?.error?.message === "USER_DATA_HARD_LIMIT_REACHED") {
        renderTierLimitWarning(
          "This account is at its hard image data cap. Remove unused images to free space."
        );
        return null;
      }
    }

    if (!data.error) return data;
    else throw new Error();
  } catch (err) {
    if (err?.name === "AbortError") throw err;
    console.log(err);
    toast.error("Error");
    return null;
  }
}
