import renderTierLimitWarning from "./renderTierLimitWarning.js";
import toast from "../components/Toast.js";

export async function getPresignedForImageDownload(imageId) {
  try {
    const res = await fetch(`${window.origin}/api/signed_URL_download`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        bucket_name: "wyrld",
        folder_name: "images",
        image_id: imageId,
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

// async function getPresignedForImageUpload(name) {
//   try {
//     const res = await fetch(`${window.origin}/api/signed_URL_upload`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "x-access-token": `Bearer ${localStorage.getItem("token")}`,
//       },
//       body: JSON.stringify({
//         name,
//         bucket_name: "wyrld",
//         folder_name: "images",
//       }),
//     });
//     const data = await res.json();

//     if (data) return data;
//     else throw new Error();
//   } catch (err) {
//     console.log(err);
//     return null;
//   }
// }

// export async function uploadImage(image) {
//   try {
//     // first get presigned url
//     const presigned = await getPresignedForImageUpload(image.name);
//     if (presigned) {
//       // take presigned data and send file to bucket
//       const formData = new FormData();

//       Object.keys(presigned.url.fields).forEach((key) => {
//         formData.append(key, presigned.url.fields[key]);
//       });
//       formData.append("file", image);

//       const resAWS = await fetch(presigned.url.url, {
//         method: "POST",
//         body: formData,
//       });
//       // if success return name of image
//       if (resAWS.status === 200 || resAWS.status === 204) {
//         return presigned.imageRef;
//       } else throw new Error();
//     } else throw new Error();
//   } catch (err) {
//     console.log(err);
//   }
// }

export async function uploadImage(
  image,
  currentProjectId,
  currentImageId,
  makeImageSmall
) {
  try {
    const formData = new FormData();
    formData.append("file", image);
    formData.append("bucket_name", "wyrld");
    formData.append("folder_name", "images");
    formData.append("project_id", currentProjectId);
    if (currentImageId) formData.append("current_file_id", currentImageId);
    if (makeImageSmall) formData.append("make_image_small", makeImageSmall);

    const res = await fetch(`${window.origin}/api/file_upload`, {
      method: "POST",
      headers: {
        // "Content-Type": "multipart/form-data",
        "x-access-token": `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });
    const data = await res.json();

    // warn about data usage and pro subscription
    if (res.status === 402 && data.error.message === "USER_IS_NOT_PRO") {
      renderTierLimitWarning(
        'You have reached your limit for uploading data such as images. Please subscribe to our "Pro" package to increase your limit. In order to continue providing our services we need your support <3. Please read about our available tiers <insert link here> and choose the best option for your future.'
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
