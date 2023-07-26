import { S3, config } from "aws-sdk";
import { readFileSync, statSync, unlinkSync } from "fs";
import { userSubscriptionStatus } from "../../lib/enums.js";
import {
  addImageQuery,
  editImageQuery,
  getImageQuery,
  removeImageQuery,
} from "../queries/images";
import { getProjectQuery, editProjectQuery } from "../queries/projects";
import { Request, Response, NextFunction } from "express";
import { getMetadata, resizeImage } from "../../lib/imageProcessing.js";
import { splitAtIndex } from "../../lib/utils.js";
import { getUserByIdQuery } from "../queries/users.js";

config.update({
  signatureVersion: "v4",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "us-east-1",
});

const s3 = new S3();

async function getSignedUrlForDownload(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const imageData = await getImageQuery(req.body.image_id);
    const objectName = imageData.rows[0].file_name;
    const params = {
      Bucket: `${req.body.bucket_name}/${req.body.folder_name}`,
      Key: objectName,
      Expires: 60 * 60 * 24 * 3,
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

// async function getSignedUrlForUpload(req: Request, res: Response, next: NextFunction) {
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

interface UploadToAwsRequestObject extends Request {
  body: {
    bucket_name: string;
    folder_name: string;
    project_id: number;
    current_file_id: number;
    make_image_small: boolean;
  };
}

async function uploadToAws(
  req: UploadToAwsRequestObject,
  res: Response,
  next: NextFunction
) {
  // check if no file
  if (!req.file) return next();

  const name = req.file.originalname;
  var ind2 = name.lastIndexOf(".");
  const type = splitAtIndex(name, ind2);
  const imageRef = req.file.filename + type[1];

  let fileSize = req.file.size;

  const fileName = req.file.filename;
  let filePath = `file_uploads/${fileName}`;

  let image = null;

  const params = {
    Bucket: `${req.body.bucket_name}/${req.body.folder_name}`,
    Key: imageRef,
    Body: readFileSync(filePath),
  };

  try {
    // check if pro // yes this is in a code block
    {
      const projectData = await getProjectQuery(req.body.project_id);
      const project = projectData.rows[0];
      const projectDataCount = project.used_data_in_bytes;

      if (projectDataCount >= 104857600) {
        // 100 MB
        if (!req.session.user) throw new Error("User is not logged in");
        const { rows } = await getUserByIdQuery(req.session.user);
        if (!rows[0].is_pro)
          throw { status: 402, message: userSubscriptionStatus.userIsNotPro };
      }
    }

    // adjust image
    if (req.body.make_image_small) {
      const smallImageWidth: number = 100;

      const imageMetadata = await getMetadata(filePath);
      if (
        imageMetadata &&
        imageMetadata.height &&
        imageMetadata.width &&
        imageMetadata.width > smallImageWidth
      ) {
        const aspectRatio = imageMetadata.width / imageMetadata.height;
        const newFilePathFromResizedImage = await resizeImage(
          filePath,
          smallImageWidth,
          smallImageWidth / aspectRatio
        );
        // remove old file
        if (newFilePathFromResizedImage) {
          // on success
          unlinkSync(filePath);
          // set new file path to resized image
          filePath = newFilePathFromResizedImage;
          // update params for aws upload
          params.Body = readFileSync(newFilePathFromResizedImage);
          const stats = statSync(newFilePathFromResizedImage);
          const fileSizeInBytes = stats.size;
          fileSize = fileSizeInBytes;
        }
      }
    }

    await new Promise((resolve, reject) => {
      s3.upload(params, (err: any, data: { Location: unknown }) => {
        if (err) {
          reject(err);
        }
        resolve(data.Location);
      });
    });

    const imageData = await addImageQuery({
      original_name: req.file.originalname,
      size: fileSize,
      file_name: imageRef,
    });
    image = imageData.rows[0];
    // send back to client
    res.send(image);
  } catch (err) {
    console.log(err);
    // delete file in storage
    unlinkSync(filePath);
    next(err);
  }

  if (image) {
    try {
      // delete file in storage
      unlinkSync(filePath);

      // prepare to update project data usage
      let dataUsageCount = 0;
      dataUsageCount += image.size;
      // remove current file in bucket if there is one
      if (req.body.current_file_id) {
        const oldImageData = await getImageQuery(req.body.current_file_id);
        const oldImage = oldImageData.rows[0];

        await removeFile(params.Bucket, oldImage);
        await removeImageQuery(req.body.current_file_id);

        dataUsageCount -= oldImage.size;
      }
      // update project data usage
      const projectData = await getProjectQuery(req.body.project_id);
      const project = projectData.rows[0];
      const newCalculatedData = project.used_data_in_bytes + dataUsageCount;
      await editProjectQuery(project.id, {
        used_data_in_bytes: newCalculatedData,
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
}

async function getImage(req: Request, res: Response, next: NextFunction) {
  try {
    const imageData = await getImageQuery(req.params.id);
    res.send(imageData.rows[0]);
  } catch (err) {
    console.log(err);
    next(err);
  }
}

async function removeImage(req: Request, res: Response, next: NextFunction) {
  try {
    // remove current file
    const imageData = await getImageQuery(req.params.image_id);
    const image = imageData.rows[0];

    await removeFile("wyrld/images", image);
    await removeImageQuery(req.params.image_id);

    // update project data usage
    const projectData = await getProjectQuery(req.params.project_id);
    const project = projectData.rows[0];
    const newCalculatedData = project.used_data_in_bytes - image.size;
    await editProjectQuery(project.id, {
      used_data_in_bytes: newCalculatedData,
    });
    res.status(204).send();
  } catch (err) {
    console.log(err);
    next(err);
  }
}

async function removeFile(bucket: string, image: { file_name: string }) {
  try {
    const params = {
      Bucket: bucket,
      Key: image.file_name,
    };

    await new Promise((resolve, reject) => {
      s3.deleteObject(params, (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data.DeleteMarker);
      });
    });
  } catch (err) {
    console.log(err);
  }
}

async function editImage(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await editImageQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export {
  getSignedUrlForDownload,
  getImage,
  editImage,
  // getSignedUrlForUpload,
  uploadToAws,
  removeFile,
  removeImage,
};
