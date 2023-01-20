import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { TusService } from './tus.service';
import { KafkaModule } from '../kafka/kafka.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from '../entity/FileEntity';

@Module({
  imports: [KafkaModule, TypeOrmModule.forFeature([FileEntity])],
  controllers: [StorageController],
  providers: [TusService],
})
export class StorageModule {}
