import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { API_SERVER_PORT, KAFKA_BROKERS } from './config/server.config';
import { Logger } from '@nestjs/common';

const logger = new Logger('main');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(API_SERVER_PORT);

  const kafka = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: KAFKA_BROKERS,
        },
      },
    },
  );
  await kafka.listen();
}

bootstrap()
  .then(() => {
    logger.verbose(`API Server is running on port ${API_SERVER_PORT}`);
    logger.verbose(`Kafka brokers: ${KAFKA_BROKERS}`);
    logger.verbose(`Demo url => http://localhost:${API_SERVER_PORT}`);
    logger.verbose(`🚀 All service started successfully 🚀`);
  })
  .catch((err) => {
    logger.error(`❌ Error starting service: ${err}`);
  });
