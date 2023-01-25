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
      command = storageConfig.windows7zipPath;
      execArgs = [
        'x',
        `${storageConfig.uploadFileStoragePath}/${fileName}`,
        `-o${storageConfig.unzipOutputPath}/${fileName}`,
      ];
    }

    return new Promise((resolve, reject) => {
      const unzip = spawn(command, execArgs);

      unzip.stderr.on('data', data => {
        this.logger.error('unzip stderr');
        this.logger.error(data);
        reject(data.toString());
      });

      unzip.on('exit', code => {
        if (code === 0) {
          this.logger.log(`unzip process successfully exited with code ${code}`);
          resolve(code);
        } else {
          this.logger.error(`unzip process failed with code ${code}`);
          reject(`unzip process exited failed code ${code}`);
        }
      });
    });
  }

  findVsiFileLocation(fileName: string): Promise<string> {
    this.logger.log(`Executing find vsi file.... ${fileName}`);
    const command = 'find';
    const execArgs = [
      `${storageConfig.unzipOutputPath}/${fileName}`,
      '-name',
      '*.vsi',
      '-print0', // print null terminated
    ];

    return new Promise((resolve, reject) => {
      const findVsi = spawn(command, execArgs);
      findVsi.stdout.on('data', data => {
        this.logger.log(`stdout: ${data}`);
        resolve(data.toString().replace('\0', ''));
      });

      findVsi.stderr.on('data', data => {
        this.logger.log(`stderr: ${data}`);
        reject(data.toString());
      });

      findVsi.on('error', error => {
        this.logger.log(`error: ${error}`);
        reject(error.toString());
      });

      findVsi.on('exit', code => {
        if (code === 0) {
          this.logger.log(`find vsi process successfully exited with code ${code}`);
        } else {
          this.logger.error(`find vsi process failed with code ${code}`);
          reject(`find vsi process failed with code ${code}`);
        }
      });
    });
  }

  execImageConvert(fileName: string, series: number, vsiFilePath): Promise<number> {
    this.logger.log(`Executing image convert.... ${fileName} series ${series}`);

    // remove Image.vsi from /0f6e94de262a4c8122d544305fa11de6/sampleData/Image.vsi
    const temp = vsiFilePath.split('/');
    const vsiFileName = temp.pop();
    const vsiDir = temp.join('/');

    const command = 'docker';
    const execArgs = [
      'run',
      '--rm', // remove container after exit
      '-v', // volume
      `${vsiDir}:/data`,
      '-v',
      `${storageConfig.imageConvertOutputPath}:/output`,
      '-v',
      `${storageConfig.bioFormatPath}:/bftools`,
      'amazoncorretto:17.0.5',
      '/bftools/bfconvert',
      '-series',
      series.toString(),
      `/data/${vsiFileName}`,
      `/output/${fileName}.tiff`,
    ];

    return new Promise((resolve, reject) => {
      const dockerBfconvert = spawn(command, execArgs);

      dockerBfconvert.stdout.on('data', data => {
        this.logger.log(`stdout: ${data}`);
      });

      dockerBfconvert.stderr.on('data', data => {
        this.logger.log(`stderr: ${data}`);
      });

      dockerBfconvert.on('error', error => {
        this.logger.log(`error: ${error}`);
      });

      dockerBfconvert.on('exit', code => {
        if (code === 0) {
          this.logger.log(`bfconvert process successfully exited with code ${code}`);
          resolve(code);
        } else {
          this.logger.error(`bfconvert process failed with code ${code}`);
          reject(`bfconvert process failed with code ${code}`);
        }
      });
    });
  }

  execTiling(fileName: string): Promise<number> {
    this.logger.log(`Executing gdal tiling.... ${fileName}`);
    const command = 'docker';
    const execArgs = [
      'run',
      '--rm', // remove container after exit
      '-v', // volume
      `${storageConfig.imageConvertOutputPath}:/data`,
      '-v',
      `${storageConfig.nginxStaticPath}:/output`,
      'osgeo/gdal:ubuntu-full-3.6.1',
      'gdal2tiles.py',
      `/data/${fileName}.tiff`,
      // `/output/${fileName}`, TODO 주석해제
      '/output',
      '-p',
      'raster',
      '--xyz',
    ];

    return new Promise((resolve, reject) => {
      const dockerGdal = spawn(command, execArgs);
      dockerGdal.on('exit', code => {
        if (code === 0) {
          this.logger.log(`gdal tiling process successfully exited with code ${code}`);
          resolve(code);
        } else {
          this.logger.error(`gdal tiling process failed with code ${code}`);
          reject(`gdal tiling process failed with code ${code}`);
        }
      });
    });
  }

  /**
   * @deprecated
   * @param fileName : string
   */
  execMoveTiledFile(fileName: string): Promise<number> {
    this.logger.log(`Executing move tiled file.... ${fileName}`);
    const command = 'mv';
    const execArgs = [
      '-r', // recursive
      `${storageConfig.imageConvertOutputPath}/${fileName}`,
      `${storageConfig.nginxStaticPath}`,
    ];

    return new Promise((resolve, reject) => {
      const moveTiledFile = spawn(command, execArgs);
      moveTiledFile.on('exit', code => {
        if (code === 0) {
          this.logger.log(`move tiled file process successfully exited with code ${code}`);
          resolve(code);
        } else {
          this.logger.error(`move tiled file process failed with code ${code}`);
          reject(`move tiled file process failed with code ${code}`);
        }
      });
    });
  }

  execRemoveTiffFile(fileName: string): Promise<number> {
    this.logger.log(`Executing remove tiff file.... ${fileName}`);
    const command = 'rm';
    const execArgs = [`${storageConfig.imageConvertOutputPath}/${fileName}.tiff`];

    return new Promise((resolve, reject) => {
      const removeTiffFile = spawn(command, execArgs);
      removeTiffFile.on('exit', code => {
        if (code === 0) {
          this.logger.log(`remove tiff file process successfully exited with code ${code}`);
          resolve(code);
        } else {
          this.logger.error(`remove tiff file process failed with code ${code}`);
          reject(`remove tiff file process failed with code ${code}`);
        }
      });
    });
  }
}
