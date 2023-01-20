import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { ShellService } from '../shell/shell.service';
import { tUploadFileKafkaPayload } from '../storage/types';
import axios from 'axios';
import { API_SERVER_PORT } from '../config/server.config';
import { TARGET_IMAGE_FIND_WAIT, TILING_WAIT } from '../config/topics.config';
import { storageConfig } from '../config/storage.config';
import { tTargetImageFind } from './types';
import { InjectRepository } from '@nestjs/typeorm';
import { FileEntity } from '../entity/FileEntity';
import { Repository } from 'typeorm';

@Injectable()
export class KafkaService {
  private logger = new Logger('KafkaService');

  constructor(
    @InjectRepository(FileEntity)
    private fileRepository: Repository<FileEntity>,
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
      const vsiPath = await this.shellService.findVsiFileLocation(payload.id);
      // TODO update database
      // 바로 카프카 토픽에 퍼블리시
      await this.handleTargetImageFind({
        ...payload,
        vsi_path: vsiPath,
      });
    } catch (unzipError) {
      // TODO update database
      try {
        await this.deleteOriginalFile(payload.id);
        this.logger.log(`file ${payload.id} deleted`);
      } catch (tusDeleteError) {
        this.logger.error('file delete failed' + tusDeleteError);
        // 아무 처리 안함
      }
    }
  }

  private async deleteOriginalFile(id: string) {
    await axios.delete(`http://localhost:${API_SERVER_PORT}/files/${id}`, {
      headers: {
        'Tus-Resumable': '1.0.0',
      },
    });
  }

  private async handleTargetImageFind(payload: tUploadFileKafkaPayload) {
    await this.publish(TARGET_IMAGE_FIND_WAIT, {
      ...payload,
      path: storageConfig.unzipOutputPath + '/' + payload.id,
    });
  }

  async handleTargetImageFindDone(payload: tTargetImageFind) {
    // TODO update database
    try {
      const vsiPath = await this.shellService.findVsiFileLocation(payload.id); // TODO 다시 찾지 말고 디비에서 가져오기

      await this.shellService.execImageConvert(payload.id, payload.series, vsiPath);
      // 변환 완료 이미지는 타일링 대기열에 추가
      await this.publish(TILING_WAIT, payload);
    } catch (e) {
      // TODO update database
      // TODO delete failed file
      this.logger.error(e);
    }
  }

  async handleTargetImageFindFail(payload: tTargetImageFind) {
    // TODO update database
    // TODO delete failed file
  }

  async handleTiling(payload: tTargetImageFind) {
    try {
      await this.shellService.execTiling(payload.id);
      await this.shellService.execRemoveTiffFile(payload.id);
      // await this.shellService.execMoveTiledFile(payload.id);
      // TODO update database
    } catch (e) {
      // TODO update database
      // TODO delete failed file
      this.logger.error(e);
    }
  }
}
