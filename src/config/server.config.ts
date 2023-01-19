import * as dotenv from 'dotenv';

// loading .env file
dotenv.config();

const prod = process.env.NODE_ENV == 'production';

export const TUS_URL_PRI_FIX = '/files';

export const API_SERVER_PORT = process.env.API_SERVER_PORT || 8080;
export const KAFKA_BROKERS = prod
  ? ['kafka-1:9092', 'kafka-2:9093', 'kafka-3:9094']
  : process.env.KAFKA_BROKERS?.split(',') || ['localhost:29092'];
