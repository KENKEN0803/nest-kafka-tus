import * as dotenv from 'dotenv';

// loading .env file
dotenv.config();

export const API_SERVER_PORT = process.env.API_SERVER_PORT || 8080;
export const KAFKA_BROKERS = process.env.KAFKA_BROKERS?.split(',') || [
  'localhost:29092',
];
