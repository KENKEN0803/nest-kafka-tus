import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import { storageConfig } from '../config/storage.config';

@Injectable()
export class ShellService {
  private logger = new Logger('ShellService');

  execUnzip(fileName: string): Promise<number> {
    this.logger.log(`Executing unzip.... ${fileName}`);
    const execArgs = [
      '-q', // quiet
      '-o', // overwrite
      '-d', // destination
      storageConfig.unzipOutputPath,
      `${storageConfig.uploadFileStoragePath}/${fileName}`,
    ];
    return new Promise((resolve, reject) => {
      const unzip = spawn('unzip', execArgs);

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

  execImageConvert(fileName: string, series: number): Promise<number> {
    this.logger.log(`Executing image convert.... ${fileName} series ${series}`);
    const VSI_FILE_ENTRY = 'Image.vsi';
    const BFTOOLS_PATH = './bftools/bfconvert';
    const execArgs = [
      '-series',
      series.toString(),
      storageConfig.unzipOutputPath + '/' + fileName + '/' + VSI_FILE_ENTRY,
      storageConfig.imageConvertOutputPath + '/' + fileName + '.tiff',
    ];
    return new Promise((resolve, reject) => {
      const bfconvert = spawn(BFTOOLS_PATH, execArgs);

      bfconvert.on('error', (error) => {
        this.logger.error(`bfconvert error: ${error.message}`);
        reject(`bfconvert error: ${error.message}`);
      });

      bfconvert.on('exit', (code) => {
        if (code === 0) {
          this.logger.log(
            `bfconvert process successfully exited with code ${code}`,
          );
          resolve(code);
        } else {
          this.logger.error(`bfconvert process exited with code ${code}`);
          reject(`bfconvert process exited with code ${code}`);
        }
      });

      bfconvert.on('disconnect', (code: number) => {
        this.logger.error(`bfconvert process disconnected with code ${code}`);
        reject(`bfconvert process disconnected with code ${code}`);
      });

      bfconvert.stderr.on('data', (data) => {
        this.logger.error(`bfconvert stderr: ${data}`);
        reject(`bfconvert stderr: ${data}`);
      });

      bfconvert.on('message', (message) => {
        this.logger.log(`bfconvert message: ${message}`);
      });
    });
  }
}
