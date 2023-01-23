const AWS = require("aws-sdk");
const uuidv4 = require("uuid/v4");

AWS.config.update({
  signatureVersion: "v4",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "us-east-1",
});

const s3 = new AWS.S3();

async function getSignedUrlForDownload(req, res, next) {
  const params = {
    Bucket: `${req.body.bucket_name}/${req.body.folder_name}`,
    Key: req.body.object_name,
    Expires: 60 * 5,
  };

  // if(req.body.download_name) params.ResponseContentDisposition = `filename="${req.body.download_name}"`

  try {
    const url = await new Promise((resolve, reject) => {
      s3.getSignedUrl("getObject", params, (err, url) => {
        err ? reject(err) : resolve(url);
      });
    });
    res.send(url);
  } catch (err) {
    next(err);
  }
}

async function getSignedUrlForUpload(req, res, next) {
  function splitAtIndex(value, index) {
    return [value.substring(0, index), value.substring(index)];
  }

  const name = req.body.name;
  const uuid = uuidv4();
  var ind2 = name.lastIndexOf(".");
  const type = splitAtIndex(name, ind2);
  const imageRef = uuid + type[1];

  const params = {
    Bucket: req.body.bucket_name,
    Fields: {
      key: `${req.body.folder_name}/${imageRef}`,
    },
    Expires: 60 * 10,
  };

  try {
    const url = await new Promise((resolve, reject) => {
      s3.createPresignedPost(params, (err, url) => {
        err ? reject(err) : resolve(url);
      });
    });
    res.send({ url, imageRef });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSignedUrlForDownload,
  getSignedUrlForUpload,
};
