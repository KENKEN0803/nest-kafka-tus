import * as dotenv from 'dotenv';

// loading .env file
dotenv.config();

const prod = process.env.NODE_ENV == 'production';
export const storageConfig = {
  storageDriver: process.env.TUS_STORAGE_DRIVER || 'FileStore',
  unzipOutputPath: prod ? '/app/files' : process.env.UNZIP_OUTPUT_PATH,
  uploadFileStoragePath: prod
    ? '/app/unzip'
    : process.env.UPLOAD_FILE_STORAGE_PATH,
  imageConvertOutputPath: prod
    ? '/app/convertedImage'
    : process.env.IMAGE_CONVERT_OUTPUT_PATH,
  bioFormatPath: prod ? '/app/bftools' : process.env.BIO_FORMAT_PATH,
  nginxStaticPath: prod ? '/app/public/xyz' : process.env.NGINX_STATIC_PATH,

  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_DEFAULT_REGION,
  bucket: process.env.AWS_BUCKET,
};
