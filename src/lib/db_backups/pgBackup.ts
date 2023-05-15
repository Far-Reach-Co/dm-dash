import { exec } from "child_process";
import {readFileSync} from "fs";
import {config as awsConfig, S3} from "aws-sdk";
import {config} from "dotenv";
config({ path: "../../../.env" });
import mail from "../../api/smtp";

awsConfig.update({
  signatureVersion: "v4",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "us-east-1",
});

const s3 = new S3();

function pgBackup() {
  function doBackup() {
    const command = `pg_dump --data-only --no-acl ${process.env.DATABASE_URL} > backup.sql`;

    exec(command, (err, stdout, stderr) => {
      if (err) {
        // node couldn't execute the command
        return;
      }

      // the *entire* stdout and stderr (buffered)
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    });
  }

  async function uploadToAws() {
    const filename = "backup.sql";
    const fileContent = readFileSync(filename);

    const params = {
      Bucket: "wyrld/pg_backups",
      Key: filename,
      Body: fileContent,
    };
    try {
      const res = await new Promise((resolve, reject) => {
        s3.upload(params, (err: any, data: { Location: unknown; }) => {
          if (err) {
            reject(err);
          }
          resolve(data.Location);
        });
      });
      return res;
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  async function runBackup() {
    async function doTheThing() {
      console.log("Running backup");
      doBackup();
      setTimeout(async () => {
        // upload to aws
        const uploadStatus = await uploadToAws();
        console.log(uploadStatus);
        // send email
        mail.sendMessage({
          user: { email: "farreachco@gmail.com" },
          title: "Database Backup",
          message: `This information will either be a location of the new backup file, or an error message: ${uploadStatus}`,
        });
      }, 10000);
    }

    // do it once on start then do it again every day
    await doTheThing();
    setInterval(async () => {
      await doTheThing();
    }, 60 * 1000 * 60 * 24);
  }

  runBackup();
}

pgBackup();

module.exports = pgBackup;
