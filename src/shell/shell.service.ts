import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import { storageConfig } from '../config/storage.config';

@Injectable()
export class ShellService {
  private logger = new Logger('ShellService');

  execUnzip(fileName: string): Promise<number> {
    this.logger.log(`Executing unzip.... ${fileName}`);
    let command;
    let execArgs;

    if (process.platform !== 'win32') {
      command = 'unzip';
      execArgs = [
        '-q', // quiet
        '-o', // overwrite
        '-d', // destination
        `${storageConfig.unzipOutputPath}/${fileName}`,
        `${storageConfig.uploadFileStoragePath}/${fileName}`,
      ];
    } else {
      command = 'tar';
      execArgs = [
        '-xvf',
        `${storageConfig.uploadFileStoragePath}/${fileName}`,
        '-C',
        `${storageConfig.unzipOutputPath}/${fileName}`,
      ];
    }

    return new Promise((resolve, reject) => {
      const unzip = spawn(command, execArgs);
      unzip.on('exit', (code) => {
        if (code === 0) {
          this.logger.log(
            `unzip process successfully exited with code ${code}`,
          );
          resolve(code);
        } else {
          this.logger.error(`unzip process failed with code ${code}`);
          reject(`unzip process exited failed code ${code}`);
        }
      });
    });
  }

  execImageConvert(fileName: string, series: number): Promise<number> {
    this.logger.log(`Executing image convert.... ${fileName} series ${series}`);
    const VSI_FILE_ENTRY = 'Image.vsi';
    // const BFTOOLS_PATH = './bftools/bfconvert';
    // const execArgs = [
    //   '-series',
    //   series.toString(),
    //   storageConfig.unzipOutputPath + '/' + fileName + '/' + VSI_FILE_ENTRY,
    //   storageConfig.imageConvertOutputPath + '/' + fileName + '.tiff',
    // ];
    const command = 'docker';
    const execArgs = [
      'run',
      '--rm', // remove container after exit
      '-v', // volume
      `${storageConfig.unzipOutputPath}:/data`,
      '-v',
      `${storageConfig.imageConvertOutputPath}:/output`,
      '-v',
      `${storageConfig.bioFormatPath}:/bftools`,
      'amazoncorretto:17.0.5',
      '/bftools/bfconvert',
      '-series',
      series.toString(),
      `/data/${fileName}/${VSI_FILE_ENTRY}`,
      `/output/${fileName}.tiff`,
    ];

    return new Promise((resolve, reject) => {
      const dockerBfconvert = spawn(command, execArgs);
      dockerBfconvert.on('exit', (code) => {
        if (code === 0) {
          this.logger.log(
            `bfconvert process successfully exited with code ${code}`,
          );
          resolve(code);
        } else {
          this.logger.error(`bfconvert process failed with code ${code}`);
          reject(`bfconvert process failed with code ${code}`);
        }
      });
    });
  }

  execGdalTiling(fileName: string): Promise<number> {
    this.logger.log(`Executing gdal translate.... ${fileName}`);
    const command = 'docker';
    const execArgs = [
      'run',
      '--rm', // remove container after exit
      '-v', // volume
      `${storageConfig.imageConvertOutputPath}:/data`,
      '-v',
      `${storageConfig.imageConvertOutputPath}:/output`,
      'osgeo/gdal:ubuntu-full-3.6.1',
      'gdal2tiles.py',
      `/data/${fileName}`,
      '/output',
      '-p',
      'raster',
      '--xyz',
    ];

    return new Promise((resolve, reject) => {
      const dockerGdal = spawn(command, execArgs);
      dockerGdal.on('exit', (code) => {
        if (code === 0 || code === 1) {
          this.logger.log(
            `gdal translate process successfully exited with code ${code}`,
          );
          resolve(code);
        } else {
          this.logger.error(`gdal translate process failed with code ${code}`);
          reject(`gdal translate process failed with code ${code}`);
        }
      });
    });
  }
}
