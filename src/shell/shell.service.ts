import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import { storageConfig } from '../config/storage.config';

@Injectable()
export class ShellService {
  private logger = new Logger('ShellService');

  execUnzip(fileName: string): Promise<number> {
    this.logger.log(`Executing unzip.... ${fileName}`);
    return new Promise((resolve, reject) => {
      const unzip = spawn('unzip', [
        '-q', // quiet
        '-o', // overwrite
        '-d', // destination
        storageConfig.unzipOutputPath,
        `${storageConfig.uploadFileStoragePath}/${fileName}`,
      ]);

      // unzip.stdout.on('data', (data) => {
      //   console.log(`stdout: ${data}`);
      // });

      unzip.stderr.on('data', (data) => {
        this.logger.error(`unzip stderr: ${data}`);
        reject(`unzip stderr: ${data}`);
      });

      unzip.on('error', (error) => {
        this.logger.error(`unzip error: ${error.message}`);
        reject(`unzip error: ${error.message}`);
      });

      // unzip.on('close', (code) => {
      //   console.log('close');
      //   console.log(`child process exited with code ${code}`);
      // });

      unzip.on('exit', (code) => {
        if (code === 0) {
          this.logger.log(
            `unzip process successfully exited with code ${code}`,
          );
          resolve(code);
        } else {
          this.logger.error(`unzip process exited with code ${code}`);
          reject(`unzip process exited with code ${code}`);
        }
      });

      unzip.on('disconnect', (code: number) => {
        this.logger.error(`unzip process disconnected with code ${code}`);
        reject(`unzip process disconnected with code ${code}`);
      });
    });
  }
}
