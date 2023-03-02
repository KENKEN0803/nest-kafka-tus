import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { API_SERVER_PORT, IS_DEV, KAFKA_BROKERS } from './lib/config/server.config';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const logger = new Logger('main');

async function bootstrap() {
  const [kafka, app] = await Promise.all([
    await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: KAFKA_BROKERS,
        },
      },
    }),
    await NestFactory.create(AppModule),
  ]);

  app.enableCors();

  if (IS_DEV) {
    const config = new DocumentBuilder()
      .setTitle('Conzar')
      .setDescription('Conzar API')
      // .setVersion(SERVER_VERSION)
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  await Promise.all([await kafka.listen(), await app.listen(API_SERVER_PORT)]);
}

bootstrap()
  .then(() => {
    logger.verbose(`APP Server is running on ${process.env.EXEC_MODE} mode`);
    logger.verbose(`API Server is running on port ${API_SERVER_PORT}`);
    logger.verbose(`Kafka brokers: ${KAFKA_BROKERS}`);
    logger.verbose(`Demo url => http://localhost:${API_SERVER_PORT}`);
    logger.verbose(`🚀 All service started successfully 🚀`);
    if (!IS_DEV) {
      logger.verbose(`Swagger is running on port http://localhost:${API_SERVER_PORT}/api`);
    }
  })
  .catch(err => {
    logger.error(`❌ Error starting service: ${err}`);
  });
