import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EVENTS, MemoryConfigstore, Server, Upload } from '@tus/server';
import { storageConfig } from 'src/config/storage.config';
import { v4 as uuid } from 'uuid';
import { FileMetadata } from './models/file-metadata.model';
import { FileStore } from '@tus/file-store';
import { S3Store } from '@tus/s3-store';
import assert from 'assert';
import * as HTTP from 'http';
import { KafkaService } from '../kafka/kafka.service';
import { UNZIP_WAIT } from '../config/topics.config';
import { TUS_URL_PRI_FIX } from '../config/server.config';
import { CustomConfigstore } from './customComfigstore/CustomConfigstore';

@Injectable()
export class TusService implements OnModuleInit {
  private tusServer;
  private logger = new Logger('TusService');

  constructor(private readonly kafkaService: KafkaService) {
    const stores = {
      S3Store: () => {
        assert.ok(
          storageConfig.accessKeyId,
          'environment variable `AWS_ACCESS_KEY_ID` must be set',
        );
        assert.ok(
          storageConfig.secretAccessKey,
          'environment variable `AWS_SECRET_ACCESS_KEY` must be set',
        );
        assert.ok(
          storageConfig.bucket,
          'environment variable `AWS_BUCKET` must be set',
        );
        assert.ok(
          storageConfig.region,
          'environment variable `AWS_REGION` must be set',
        );

        return new S3Store({
          bucket: storageConfig.bucket,
          accessKeyId: storageConfig.accessKeyId,
          secretAccessKey: storageConfig.secretAccessKey,
          region: storageConfig.region,
          partSize: 8 * 1024 * 1024, // each uploaded part will have ~8MB,
        });
      },
      FileStore: () => {
        const configstore = new CustomConfigstore();
        // const configstore = new MemoryConfigstore();
        // const configstore = undefined; // use default configstore => ~/.config/configstore/

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
      namingFunction: this.fileNameFromRequest,
      onUploadFinish: this.onUploadFinish,
      onUploadCreate: this.onUploadCreate,
    });
  }

  onModuleInit() {
    this.initializeTusServer();
  }

  async handleTus(req: HTTP.IncomingMessage, res: HTTP.ServerResponse) {
    return this.tusServer.handle(req, res);
  }

  private onUploadCreate = async (
    req: HTTP.IncomingMessage,
    res: HTTP.ServerResponse<HTTP.IncomingMessage>,
    upload: Upload,
  ): Promise<HTTP.ServerResponse<HTTP.IncomingMessage>> => {
    console.log(upload);
    this.logger.verbose('UploadCreate');
    return res;
  };

  private onUploadFinish = async (
    req: HTTP.IncomingMessage,
    res: HTTP.ServerResponse<HTTP.IncomingMessage>,
    upload: Upload,
  ): Promise<HTTP.ServerResponse<HTTP.IncomingMessage>> => {
    console.log(upload);
    this.logger.verbose('UploadFinish');
    // 카프카 메시지 전송
    await this.kafkaService.publish(UNZIP_WAIT, {
      fileId: upload.id,
      metadata: upload.metadata,
    });
    return res;
  };

  private fileNameFromRequest = (req: any) => {
    try {
      const metadata = this.getFileMetadata(req);

      const prefix: string = uuid();

      const fileName = metadata.extension
        ? prefix + '.' + metadata.extension
        : prefix;

      return fileName;
    } catch (e) {
      this.logger.error(e);

      // rethrow error
      throw e;
    }
  };

  private getFileMetadata(req: any): FileMetadata {
    const uploadMeta: string = req.header('Upload-Metadata');
    const metadata = new FileMetadata();

    uploadMeta.split(',').map((item) => {
      const tmp = item.split(' ');
      const key = tmp[0];
      const value = Buffer.from(tmp[1], 'base64').toString('ascii');
      metadata[`${key}`] = value;
    });

    let extension: string = metadata.name
      ? metadata.name.split('.').pop()
      : null;
    extension = extension && extension.length === 3 ? extension : null;
    metadata.extension = extension;

    return metadata;
  }

  private initializeTusServer() {
    this.logger.verbose(`Initializing Tus File Upload Server`);
    this.logger.verbose(`Storage Driver: ${storageConfig.storageDriver}`);
    this.logger.verbose(`Unzip Output Path: ${storageConfig.unzipOutputPath}`);
    this.logger.verbose(
      `Upload File Storage Path: ${storageConfig.uploadFileStoragePath}`,
    );
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
      // 작동안함
      this.logger.verbose(`Upload EVENTS.POST_TERMINATE `);
    });
  }
}
