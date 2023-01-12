import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StorageModule } from './storage/storage.module';
import { KafkaModule } from './kafka/kafka.module';
import { ShellModule } from './shell/shell.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [StorageModule, KafkaModule, ShellModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
