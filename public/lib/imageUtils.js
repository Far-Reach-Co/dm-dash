import renderTierLimitWarning from "../components/renderTierLimitWarning.js";
import toast from "../components/Toast.js";

export async function getPresignedUrlsForImages(imageIds) {
  try {
    const res = await fetch(`${window.origin}/api/signed_URL_download_multi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bucket_name: "wyrld",
        folder_name: "images",
        image_ids: imageIds,
      }),
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
  makeImageSmall
) {
  try {
    const formData = new FormData();
    formData.append("file", image);
    formData.append("bucket_name", "wyrld");
    formData.append("folder_name", "images");
    formData.append("project_id", currentProjectId);
    if (makeImageSmall) formData.append("make_image_small", makeImageSmall);

    const res = await fetch(`${window.origin}/api/new_image_for_project`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    // warn about data usage for poject
    if (res.status === 402 && data.error.message === "PROJECT_IS_NOT_PRO") {
      renderTierLimitWarning(
        'You have reached the image data limit for this project. Please subscribe to our "Pro Wyrld" package to increase the limit.'
      );
      return null;
    }

    if (!data.error) return data;
    else throw new Error();
  } catch (err) {
    console.log(err);
    toast.error("Error");
    return null;
  }
}

export async function uploadUserImage(image, makeImageSmall) {
  try {
    const formData = new FormData();
    formData.append("file", image);
    formData.append("bucket_name", "wyrld");
    formData.append("folder_name", "images");
    if (makeImageSmall) formData.append("make_image_small", makeImageSmall);

    const res = await fetch(`${window.origin}/api/new_image_for_user`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    // warn about data usage for user
    if (res.status === 402 && data.error.message === "USER_IS_NOT_PRO") {
      renderTierLimitWarning(
        'You have reached the image data limit for this account. Please subscribe to our "Pro User" package to increase the limit.'
      );
      return null;
    }

    if (!data.error) return data;
    else throw new Error();
  } catch (err) {
    console.log(err);
    toast.error("Error");
    return null;
  }
}
