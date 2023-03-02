import * as dotenv from 'dotenv';

// loading .env file
dotenv.config();

export const IS_DEV = process.env.EXEC_MODE === 'dev';

export const TUS_URL_PRI_FIX = '/files';

export const API_SERVER_PORT = process.env.API_SERVER_PORT || 8080;
export const KAFKA_BROKERS = process.env.KAFKA_BROKERS?.split(',') || ['localhost:29092'];

export const MARIA_DB_CONNECTION_CONFIG = {
  host: process.env.MARIA_DB_HOST || 'localhost',
  port: +process.env.MARIA_DB_PORT || 3306,
  username: process.env.MARIA_DB_USERNAME || 'root',
  password: process.env.MARIA_DB_PASSWORD || '1234',
  database: process.env.MARIA_DB_DATABASE || 'nest',
};
