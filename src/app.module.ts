import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_CLIENT_MODULE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'tester1',
            brokers: ['localhost:29092'],
          },
          consumer: {
            groupId: 'test-group-id',
          },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
