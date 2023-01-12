import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  KafkaContext,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';
import { KafkaService } from './kafka.service';
import { UNZIP_WAIT } from '../config/topics.config';

@Controller()
export class KafkaController {
  constructor(private readonly kafkaService: KafkaService) {}

  private logger = new Logger('KafkaController');

  @MessagePattern(UNZIP_WAIT)
  async shiftUnzip(@Payload() payload: any, @Ctx() ctx: KafkaContext) {
    this.logger.verbose('unzip-wait');
    const heartbeat = await ctx.getHeartbeat();
    const interval = setInterval(() => {
      heartbeat();
    }, 5000);
    try {
      console.log(payload);
      await this.kafkaService.handleUnzip(payload.fileId, ctx);
    } catch (e) {
      this.logger.error(e);
    } finally {
      clearInterval(interval);
    }
  }
}
