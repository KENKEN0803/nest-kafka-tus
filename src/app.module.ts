import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KAFKA_BROKERS } from './config/server.config';
import { StorageModule } from './storage/storage.module';
import { KafkaModule } from './kafka/kafka.module';
import { ShellModule } from './shell/shell.module';
import { UserModule } from './user/user.module';

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
    KafkaModule,
    ShellModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
