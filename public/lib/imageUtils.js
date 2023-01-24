export async function getPresignedForImageDownload(imageRef) {
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
        object_name: imageRef,
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

async function getPresignedForImageUpload(name) {
  try {
    const res = await fetch(`${window.origin}/api/signed_URL_upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        name,
        bucket_name: "wyrld",
        folder_name: "images",
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
