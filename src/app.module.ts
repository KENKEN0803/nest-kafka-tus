import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KAFKA_BROKERS } from './config/server.config';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_CLIENT_MODULE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'tester1',
            brokers: KAFKA_BROKERS,
          },
          consumer: {
            groupId: 'test-group-id',
          },
        },
      },
    ]),
    StorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
