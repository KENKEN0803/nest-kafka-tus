import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka, KafkaContext } from '@nestjs/microservices';
import { ShellService } from '../shell/shell.service';

@Injectable()
export class KafkaService {
  constructor(
    @Inject('KAFKA_CLIENT_MODULE') private readonly kafkaClient: ClientKafka,
    private readonly shellService: ShellService,
  ) {}

  async publish(topic: string, payload: any) {
    await this.kafkaClient.emit(topic, payload);
  }

  async handleUnzip(payload: any, ctx: KafkaContext) {
    await this.shellService.execUnzip(payload);
  }
}
