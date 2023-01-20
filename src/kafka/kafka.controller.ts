import { Controller, Logger } from '@nestjs/common';
import { Ctx, KafkaContext, MessagePattern, Payload } from '@nestjs/microservices';
import { KafkaService } from './kafka.service';
import { TARGET_IMAGE_FIND_DONE, TILING_WAIT, UNZIP_WAIT } from '../config/topics.config';
import { tUploadFileKafkaPayload } from '../storage/types';
import { tTargetImageFind } from './types';

@Controller()
export class KafkaController {
  private logger = new Logger('KafkaController');

  readonly HEART_BEAT_INTERVAL = 5000;

  constructor(private readonly kafkaService: KafkaService) {}

  @MessagePattern(UNZIP_WAIT)
  async shiftUnzip(@Payload() payload: tUploadFileKafkaPayload, @Ctx() ctx: KafkaContext) {
    this.logger.log('@MessagePattern(UNZIP_WAIT) message received');
    this.logger.log(payload);

    const heartbeat = await ctx.getHeartbeat();
    const interval = setInterval(() => {
      heartbeat();
    }, this.HEART_BEAT_INTERVAL);
    try {
      await this.kafkaService.handleUnzip(payload);
    } catch (e) {
      // 메시지 재시도 안함
      this.logger.error(e);
    } finally {
      clearInterval(interval);
    }
  }

  @MessagePattern(TARGET_IMAGE_FIND_DONE)
  async shiftTargetImageFindDone(@Payload() payload: tTargetImageFind, @Ctx() ctx: KafkaContext) {
    this.logger.log('@MessagePattern(TARGET_IMAGE_FIND_DONE)');
    this.logger.log(payload);

    const heartbeat = await ctx.getHeartbeat();
    const interval = setInterval(() => {
      heartbeat();
    }, this.HEART_BEAT_INTERVAL);
    try {
      if (payload.series === null || payload.series === undefined) {
        // 시리즈번호가 없다 === 실패했을 경우
        await this.kafkaService.handleTargetImageFindFail(payload);
      } else {
        await this.kafkaService.handleTargetImageFindDone(payload);
      }
    } catch (e) {
      // 메시지 재시도 안함
      this.logger.error(e);
    } finally {
      clearInterval(interval);
    }
  }

  @MessagePattern(TILING_WAIT)
  async shiftTilingWait(@Payload() payload: tTargetImageFind, @Ctx() ctx: KafkaContext) {
    this.logger.log('@MessagePattern(TILING_WAIT)');
    this.logger.log(payload);

    const heartbeat = await ctx.getHeartbeat();
    const interval = setInterval(() => {
      heartbeat();
    }, this.HEART_BEAT_INTERVAL);
    try {
      await this.kafkaService.handleTiling(payload);
    } catch (e) {
      // 메시지 재시도 안함
      this.logger.error(e);
    } finally {
      clearInterval(interval);
    }
  }
}
