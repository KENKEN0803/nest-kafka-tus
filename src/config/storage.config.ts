import * as dotenv from 'dotenv';

// loading .env file
dotenv.config();

export const storageConfig = {
  storageDriver: process.env.TUS_STORAGE_DRIVER || 'FileStore',
  unzipOutputPath: process.env.UNZIP_OUTPUT_PATH,
  uploadFileStoragePath: process.env.UPLOAD_FILE_STORAGE_PATH,
  imageConvertOutputPath: process.env.IMAGE_CONVERT_OUTPUT_PATH,
  bioFormatPath: process.env.BIO_FORMAT_PATH,

  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_DEFAULT_REGION,
  bucket: process.env.AWS_BUCKET,
};
