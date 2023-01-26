import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StorageModule } from './storage/storage.module';
import { KafkaModule } from './kafka/kafka.module';
import { ShellModule } from './shell/shell.module';
import { UserModule } from './user/user.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MARIA_DB_CONNECTION_CONFIG } from './config/server.config';

@Module({
  imports: [
    // TODO nginx로 바꿔야함
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    TypeOrmModule.forRoot({
      ...MARIA_DB_CONNECTION_CONFIG,
      type: 'mariadb',
      autoLoadEntities: true,
      synchronize: true,
      charset: 'utf8mb4',
      timezone: '+09:00',
    }),
    StorageModule,
    KafkaModule,
    ShellModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
