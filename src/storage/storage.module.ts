import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { TusService } from './tus.service';
import { KafkaModule } from '../kafka/kafka.module';

@Module({
  imports: [KafkaModule],
  controllers: [StorageController],
  providers: [TusService],
})
export class StorageModule {}
