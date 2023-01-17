import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { ShellService } from '../shell/shell.service';
import { tUploadFileKafkaPayload } from '../storage/types';
import axios from 'axios';
import { API_SERVER_PORT } from '../config/server.config';

@Injectable()
export class KafkaService {
  private logger = new Logger('KafkaService');

  constructor(
    @Inject('KAFKA_CLIENT_MODULE') private readonly kafkaClient: ClientKafka,
    private readonly shellService: ShellService,
  ) {}

  async publish(topic: string, payload: any) {
    this.logger.log(`kafka publishing to topic ${topic} payload ${payload}`);
    await this.kafkaClient.emit(topic, payload);
  }

  async handleUnzip(payload: tUploadFileKafkaPayload) {
    try {
      await this.shellService.execUnzip(payload.id);
      // TODO update database
    } catch (unzipError) {
      // TODO update database
      try {
        await axios.delete(
          `http://localhost:${API_SERVER_PORT}/files/${payload.id}`,
          {
            headers: {
              'Tus-Resumable': '1.0.0',
            },
          },
        );
        this.logger.log(`file ${payload.id} deleted`);
      } catch (tusDeleteError) {
        this.logger.error('file delete failed' + tusDeleteError);
        // 아무 처리 안함
      }
    }
  }
}
