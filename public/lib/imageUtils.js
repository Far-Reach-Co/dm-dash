import { postThing } from "./apiUtils.js";

export async function getPresignedForImageDownload(imageRef) {
  const data = await postThing("/api/signed_URL_download", {
    bucket_name: "wyrld",
    folder_name: "images",
    object_name: imageRef,
  })
  if(data) return data;
  else return null;
}

async function getPresignedForImageUpload(name) {
  const data = await postThing("/api/signed_URL_upload", {
    name,
    bucket_name: "wyrld",
    folder_name: "images",
  })
  if(data) return data;
  else return null;
}

export async function uploadImage(image) {
  try {
    // first get presigned url
    const presigned = await getPresignedForImageUpload(image.name);
    if (presigned) {
      // take presigned data and send file to bucket
      const formData = new FormData();

      Object.keys(presigned.url.fields).forEach((key) => {
        formData.append(key, presigned.url.fields[key]);
      });
      formData.append("file", image);

      const resAWS = await fetch(presigned.url.url, {
        method: "POST",
        body: formData,
      });
      // if success return name of image
      if (resAWS.status === 200 || resAWS.status === 204) {
        return presigned.imageRef;
      } else throw new Error();
    } else throw new Error();
  } catch (err) {
    console.log(err);
  }
}
