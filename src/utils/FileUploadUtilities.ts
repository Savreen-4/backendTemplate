import multer from 'multer';
import fs from 'fs';
import path from 'path';
import * as AWS from "aws-sdk";
import { v4 as uuidv4 } from 'uuid';

const options: any = {
  secretAccessKey:  process.env.AWS_BUCKET_SECRET,
  accessKeyId:  process.env.AWS_BUCKET_ACCESS_KEY,
  region:  process.env.AWS_BUCKET_REGION,
  endpoint:  process.env.AWS_BUCKET_ENDPOINT
};

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    const path = "temp/";
    fs.mkdirSync(path, { recursive: true });
    return cb(null, path);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 5MB
  }
});

export const uploadFile = (fieldName: string, isArray: boolean = false) => {
  return isArray ? upload.array(fieldName) : upload.single(fieldName);
};

export const manageMulteraws = () => {
    const uploadDir = path.join(__dirname, '../temp');

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    return multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, uploadDir);
            },
            filename: (req, file, cb) => {
                let customFileName = Date.now();
                let fileExtension = path.extname(file.originalname).split('.')[1];
                cb(null, customFileName + '.' + fileExtension);
            }
        }),
        limits: {
          fileSize: 20 * 1024 * 1024, // ✅ 5MB file size limit
        },
    });
};

export const uploadFileAWS = async (files: any) => {
  try {
    let images: any = [];
    if (files && files.length) {
      for (let file of files) {
        // let url: any = await FileUpload.uploadFileToAWS(file);
        // images.push(url?.Location);
      }
    }
    return images;
  } catch (error) {
    console.error("❌ Error file upload:", error);
  }
};

export class FileUpload {
  public static uploadFileToAWS = async (file: any, type: string, subfolder: any) => {

    AWS.config.update(options);
    const s3 = new AWS.S3();
    const fileExt = path.extname(file.originalname);
    const fileRandomName = uuidv4();
    let newName: any;
    let fileContent;
    if (file.mimetype.indexOf('image/') > -1) {
      newName = `${fileRandomName}`;
      // fileContent = fs.createReadStream(`temp/${newName}`);
      fileContent = fs.createReadStream(file.path);
    } else {
      fileContent = fs.createReadStream(file.path);
      newName = `${fileRandomName}${fileExt}`;
    }
    // fs.unlinkSync(file.path);

    let newFile: any;

    if (type == 'profile') {
      newFile = `${type}/${newName}`;
    }

    const params = {
      // ACL: 'public-read',
      ContentType: file.mimetype,
      Bucket: `${process.env.AWS_BUCKET_NAME}`,
      Body: fileContent,
      Key: `${newFile}`,
    };

    try {
      s3.upload(params, function (err: any, resdata: any) {
        if (err) {
          console.log("aws error ==== ", err);
          return err;
        }
        else {
          if (file.mimetype.indexOf('image/') > -1) {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
            if (fs.existsSync(`temp/${newName}`)) {
              fs.unlinkSync(`temp/${newName}`);
            }
          } else {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          }
        }
      });
    } catch (err) {
      newFile = '';  //if its not uploaded empty the image name
      console.log(`Error uploading file to S3. Details: `, err);
    }
    return newFile;
  }


  public static async delete(type: string, fileName: any) {
    AWS.config.update(options);
    const s3 = new AWS.S3();

    let oldFile: any;
    oldFile = fileName

    const params = {
      Bucket: `${process.env.AWS_BUCKET_NAME}`,
      Key: `${oldFile}`
      // Key: `${type}/${fileName}`
    };

    try {
      await s3.deleteObject(params).promise();
      return true;
    } catch (err) {
      return false;
    }
  }
}