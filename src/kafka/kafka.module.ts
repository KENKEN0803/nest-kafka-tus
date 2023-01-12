import { Module } from '@nestjs/common';
import { KafkaController } from './kafka.controller';
import { KafkaService } from './kafka.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KAFKA_BROKERS } from '../config/server.config';
import { ShellModule } from '../shell/shell.module';

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
    ShellModule,
  ],
  controllers: [KafkaController],
  providers: [KafkaService],
  exports: [KafkaService],
})
export class KafkaModule {}
