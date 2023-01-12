import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { API_SERVER_PORT, KAFKA_BROKERS } from './config/server.config';

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
    console.info(`=================================`);
    console.info(`API_SERVER_PORT: ${API_SERVER_PORT}`);
    console.info(`KAFKA_BROKERS: ${KAFKA_BROKERS}`);
    console.info(`🚀 All service started successfully`);
    console.info(`http://localhost:${API_SERVER_PORT}`);
    console.info(`=================================`);
  })
  .catch((err) => {
    console.error(err);
  });
