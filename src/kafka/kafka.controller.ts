import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  KafkaContext,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';
import { KafkaService } from './kafka.service';
import { UNZIP_WAIT } from '../config/topics.config';
import { tUploadFileKafkaPayload } from '../storage/types';

@Controller()
export class KafkaController {
  private logger = new Logger('KafkaController');

  constructor(private readonly kafkaService: KafkaService) {}

  @MessagePattern(UNZIP_WAIT)
  async shiftUnzip(
    @Payload() payload: tUploadFileKafkaPayload,
    @Ctx() ctx: KafkaContext,
  ) {
    this.logger.verbose('@MessagePattern(UNZIP_WAIT) message received');
    const heartbeat = await ctx.getHeartbeat();
    const interval = setInterval(() => {
      heartbeat();
    }, 5000);
    try {
      console.log(payload);
      await this.kafkaService.handleUnzip(payload);
    } catch (e) {
      // 메시지 재시도 안함
      this.logger.error(e);
    } finally {
      clearInterval(interval);
    }
  }
}
