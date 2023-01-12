import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { KAFKA_BROKERS } from './config/constraint';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);

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

bootstrap().then(() => console.log('Application is running on: 3000'));
