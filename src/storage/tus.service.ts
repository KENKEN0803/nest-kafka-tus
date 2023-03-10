import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EVENTS, Server, Upload } from '@tus/server';
import { storageConfig } from 'src/lib/config/storage.config';
import { FileMetadata } from '../models/file-metadata.model';
import { FileStore } from '@tus/file-store';
import { S3Store } from '@tus/s3-store';
import assert from 'assert';
import { KafkaService } from '../kafka/kafka.service';
import { UNZIP_WAIT } from '../lib/config/topics.config';
import { TUS_URL_PRI_FIX } from '../lib/config/server.config';
import { tUploadFileKafkaPayload } from './types';
import { Request, Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { FileEntity, FileStatus } from '../entity/FileEntity';
import { Repository } from 'typeorm';

@Injectable()
export class TusService implements OnModuleInit {
  private tusServer;
  private logger = new Logger('TusService');

  constructor(
    private readonly kafkaService: KafkaService,
    @InjectRepository(FileEntity)
    private fileRepository: Repository<FileEntity>,
  ) {
    const stores = {
      S3Store: () => {
        // assert.ok(storageConfig.accessKeyId, 'environment variable `AWS_ACCESS_KEY_ID` must be set');
        // assert.ok(storageConfig.secretAccessKey, 'environment variable `AWS_SECRET_ACCESS_KEY` must be set');
        // assert.ok(storageConfig.bucket, 'environment variable `AWS_BUCKET` must be set');
        // assert.ok(storageConfig.region, 'environment variable `AWS_REGION` must be set');
        //
        // return new S3Store({
        //   bucket: storageConfig.bucket,
        //   accessKeyId: storageConfig.accessKeyId,
        //   secretAccessKey: storageConfig.secretAccessKey,
        //   region: storageConfig.region,
        //   partSize: 8 * 1024 * 1024, // each uploaded part will have ~8MB,
        // });
      },
      FileStore: () => {
        // const configstore = new CustomConfigstore();
        // const configstore = new MemoryConfigstore();
        const configstore = undefined; // use default configstore => ~/.config/configstore/

        return new FileStore({
          directory: storageConfig.uploadFileStoragePath,
          configstore,
        });
      },
    };

    const storeName = storageConfig.storageDriver || 'FileStore';

    const store = stores[storeName];

    this.tusServer = new Server({
      path: TUS_URL_PRI_FIX,
      datastore: store(),
      // namingFunction: this.fileNameFromRequest, ????????????????????? ????????? ?????????????????? ?????????
      onUploadFinish: this.onUploadFinish,
      onUploadCreate: this.onUploadCreate,
    });
  }

  onModuleInit() {
    this.initializeTusServer();
  }

  async handleTus(req: Request, res: Response) {
    return this.tusServer.handle(req, res);
  }

  private onUploadCreate = async (req: Request, res: Response, upload: Upload): Promise<Response> => {
    try {
      this.logger.verbose('UploadCreate ' + upload.id);

      const metadata = this.extractMetadata(upload.metadata.toString());

      const originalFilename = metadata.filename;
      if (!originalFilename) {
        throw new Error('originalFilename extract fail');
      }
      const mimeType = metadata.filetype;
      if (!mimeType) {
        throw new Error('mimeType extract fail');
      }

      const payload: tUploadFileKafkaPayload = {
        id: upload.id,
        size: upload.size,
        offset: upload.offset,
        creation_date: upload.creation_date,
        original_filename: originalFilename,
        mimetype: mimeType,
      };

      await this.fileRepository.save({
        ...payload,
        status: FileStatus.UPLOADING,
      });

      return res;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  };

  private onUploadFinish = async (req: Request, res: Response, upload: Upload): Promise<Response> => {
    try {
      this.logger.verbose('onUploadFinish ' + upload.id);

      const metadata = this.extractMetadata(upload.metadata.toString());

      const originalFilename = metadata.filename;
      if (!originalFilename) {
        throw new Error('originalFilename extract fail');
      }
      const mimeType = metadata.filetype;
      if (!mimeType) {
        throw new Error('mimeType extract fail');
      }

      const payload: tUploadFileKafkaPayload = {
        id: upload.id,
        size: upload.size,
        offset: upload.offset,
        creation_date: upload.creation_date,
        original_filename: originalFilename,
        mimetype: mimeType,
      };

      await this.fileRepository.update({ id: upload.id }, { ...payload, status: FileStatus.UNZIP });

      // ????????? ????????? ??????
      await this.kafkaService.publish(UNZIP_WAIT, payload);
      return res;
    } catch (e) {
      await this.fileRepository.update(
        { id: upload.id },
        { status: FileStatus.ERROR, status_message: '?????? ????????? ?????? ' + e.message },
      );
      this.logger.error('onUploadFinish error' + e);
    }
  };

  private fileNameFromRequest = (req: Request) => {
    try {
      const metadata = this.getFileMetadata(req);

      const prefix = new Date().getTime().toString();

      return metadata.extension && metadata.name ? prefix + '_' + metadata.name + '.' + metadata.extension : prefix;
    } catch (e) {
      this.logger.error(e);

      // rethrow error
      throw e;
    }
  };

  private getFileMetadata(req: Request): FileMetadata {
    const uploadMeta: string = req.header('Upload-Metadata'); // tus ???????????? ??????
    const metadata = this.extractMetadata(uploadMeta);

    let extension: string = metadata.filename ? metadata.filename.split('.').pop() : null;
    extension = extension && extension.length === 3 ? extension : null;
    metadata.extension = extension;

    metadata.name = metadata.filename ? metadata.filename.split('.').shift() : null;
    return metadata;
  }

  private extractMetadata(uploadMeta: string) {
    if (typeof uploadMeta === 'string') {
      // filename aGprbHNmaGRsa2pnYWRza2Yuemlw,filetype YXBwbGljYXRpb24vemlw
      const metadata = new FileMetadata();

      uploadMeta.split(',').map(item => {
        const [key, value] = item.split(' '); // tus ???????????? ??????
        if (value && key) {
          metadata[key] = Buffer.from(value, 'base64').toString('utf-8');
        }
      });

      return metadata;
    } else {
      // ?????????/?????? ??????????????? uploadMeta??? string??? ?????? object??? ??????????
      return uploadMeta;
    }
  }

  private initializeTusServer() {
    this.logger.verbose(`Initializing Tus File Upload Server`);
    this.logger.verbose(`Storage Driver: ${storageConfig.storageDriver}`);
    this.logger.verbose(`Unzip Output Path: ${storageConfig.unzipOutputPath}`);
    this.logger.verbose(`Upload File Storage Path: ${storageConfig.uploadFileStoragePath}`);
    this.tusServer.on(EVENTS.POST_RECEIVE, (...args) => {
      this.logger.verbose(`Upload EVENTS.POST_RECEIVE`);
    });
    this.tusServer.on(EVENTS.POST_CREATE, (...args) => {
      this.logger.verbose(`Upload EVENTS.POST_CREATE`);
    });
    this.tusServer.on(EVENTS.POST_FINISH, (...args) => {
      this.logger.verbose(`Upload EVENTS.POST_FINISH`);
    });
    this.tusServer.on(EVENTS.POST_TERMINATE, (...args) => {
      // ????????????
      this.logger.verbose(`Upload EVENTS.POST_TERMINATE `);
    });
  }
}
