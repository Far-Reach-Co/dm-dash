const AWS = require("aws-sdk");
const fs = require("fs");
const {
  addImageQuery,
  getImageQuery,
  removeImageQuery,
} = require("../queries/images");
const { getProjectQuery, editProjectQuery } = require("../queries/projects");

AWS.config.update({
  signatureVersion: "v4",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "us-east-1",
});

const s3 = new AWS.S3();

async function getSignedUrlForDownload(req, res, next) {
  try {
    const imageData = await getImageQuery(req.body.image_id);
    const objectName = imageData.rows[0].file_name;
    const params = {
      Bucket: `${req.body.bucket_name}/${req.body.folder_name}`,
      Key: objectName,
      Expires: 60 * 5,
    };
    // if(req.body.download_name) params.ResponseContentDisposition = `filename="${req.body.download_name}"`
    const url = await new Promise((resolve, reject) => {
      s3.getSignedUrl("getObject", params, (err, url) => {
        err ? reject(err) : resolve(url);
      });
    });
    res.send({ url });
  } catch (err) {
    next(err);
  }
}

// async function getSignedUrlForUpload(req, res, next) {
//   function splitAtIndex(value, index) {
//     return [value.substring(0, index), value.substring(index)];
//   }

//   const name = req.body.name;
//   const uuid = uuidv4();
//   var ind2 = name.lastIndexOf(".");
//   const type = splitAtIndex(name, ind2);
//   const imageRef = uuid + type[1];

//   const params = {
//     Bucket: req.body.bucket_name,
//     Fields: {
//       key: `${req.body.folder_name}/${imageRef}`,
//     },
//     Expires: 60 * 10,
//   };

//   try {
//     const url = await new Promise((resolve, reject) => {
//       s3.createPresignedPost(params, (err, url) => {
//         err ? reject(err) : resolve(url);
//       });
//     });
//     res.send({ url, imageRef });
//   } catch (err) {
//     next(err);
//   }
// }

async function uploadToAws(req, res, next) {
  console.log(req.file, "***************************************");
  // helper function to split at index
  function splitAtIndex(value, index) {
    return [value.substring(0, index), value.substring(index)];
  }

  const name = req.file.originalname;
  var ind2 = name.lastIndexOf(".");
  const type = splitAtIndex(name, ind2);
  const imageRef = req.file.filename + type[1];

  const params = {
    Bucket: `${req.body.bucket_name}/${req.body.folder_name}`,
    Key: imageRef,
    Body: fs.readFileSync(`file_uploads/${req.file.filename}`),
  };

  let image = null;

  try {
    await new Promise((resolve, reject) => {
      s3.upload(params, (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data.Location);
      });
    });

    const imageData = await addImageQuery({
      original_name: req.file.originalname,
      size: req.file.size,
      file_name: imageRef,
    });
    image = imageData.rows[0];
    // send back to client
    res.send(image);
  } catch (err) {
    console.log(err);
    next(err);
  }

  if (image) {
    try {
      // delete file in storage
      const filePath = `file_uploads/${req.file.filename}`;
      fs.unlinkSync(filePath);

      // prepare to update project data usage
      let dataUsageCount = 0;
      console.log("************** TESTING TODAY *******************")
      dataUsageCount += image.size;
      console.log(dataUsageCount)
      // remove current file in bucket if there is one
      if (req.body.current_file_id) {
        const oldImageData = await getImageQuery(req.body.current_file_id);
        const oldImage = oldImageData.rows[0];

        await removeFile(params.Bucket, oldImage);
        await removeImageQuery(req.body.current_file_id);

        dataUsageCount -= oldImage.size;
        console.log(dataUsageCount)
      }
      // update project data usage
      const projectData = await getProjectQuery(req.body.project_id);
      const project = projectData.rows[0];
      const newCalculatedData = project.used_data_in_bytes + dataUsageCount;
      console.log(newCalculatedData)
      await editProjectQuery(project.id, {
        used_data_in_bytes: newCalculatedData,
      });
    } catch (err) {
      console.log(err);
    }
  }
}

async function removeFile(bucket, image) {
  try {
    const params = {
      Bucket: bucket,
      Key: image.file_name,
    };

    const awsRes = await new Promise((resolve, reject) => {
      s3.deleteObject(params, (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data.DeleteMarker);
      });
    });
    console.log(awsRes);
    if (!awsRes) throw awsRes;
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  getSignedUrlForDownload,
  // getSignedUrlForUpload,
  uploadToAws,
  removeFile,
};
