import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import { storageConfig } from '../config/storage.config';

@Injectable()
export class ShellService {
  execUnzip(fileName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const unzip = spawn('unzip', [
        '-q', // quiet
        '-o', // overwrite
        '-d', // destination
        storageConfig.unzipOutputPath,
        `${storageConfig.uploadFileStoragePath}/${fileName}`,
      ]);
      unzip.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });

      unzip.stderr.on('data', (data) => {
        console.log("shell.stderr.on('data'");
        console.log(`stderr: ${data}`);
      });

      unzip.on('error', (error) => {
        console.log("shell.on('error'");
        console.log(`error: ${error.message}`);
      });

      unzip.on('close', (code) => {
        console.log('close');
        console.log(`child process exited with code ${code}`);
      });

      unzip.on('exit', (code) => {
        console.log('exit');
        console.log(`child process exited with code ${code}`);
        if (code === 0) {
          resolve('success');
        } else {
          resolve('error');
          // todo implement exception handling
        }
      });

      unzip.on('disconnect', (code: number) => {
        console.log('disconnect');
        console.log(`child process exited with code ${code}`);
      });
    });
  }
}
