import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { ShellService } from '../shell/shell.service';
import { tUploadFileKafkaPayload } from '../storage/types';

@Injectable()
export class KafkaService {
  constructor(
    @Inject('KAFKA_CLIENT_MODULE') private readonly kafkaClient: ClientKafka,
    private readonly shellService: ShellService,
  ) {}

  async publish(topic: string, payload: any) {
    await this.kafkaClient.emit(topic, payload);
  }

  async handleUnzip(payload: tUploadFileKafkaPayload) {
    try {
      await this.shellService.execUnzip(payload.id);
      // TODO update database
      // await this.publish('unzip-complete', payload);
    } catch (e) {
      // TODO update database
      // TODO delete file
      // await this.publish('unzip-fail', payload);
      // throw e;
    }
  }
}
