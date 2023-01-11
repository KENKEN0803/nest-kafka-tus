import { Inject, Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import { ClientKafka, KafkaContext } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(
    @Inject('KAFKA_CLIENT_MODULE') private readonly kafkaClient: ClientKafka,
  ) {}

  sendToKafka() {
    const data = {
      key: 'key',
      value: 'value',
    };
    this.kafkaClient.emit('test', data);
    // this.kafkaClient.send('test', data);
  }

  unZipFunc(fileName: string, kafkaContext: KafkaContext): Promise<string> {
    // send heartbeat to kafka
    const heartbeat = kafkaContext.getHeartbeat();
    const timer = setInterval(() => {
      heartbeat();
    }, 5000);

    return new Promise((resolve, reject) => {
      // const ls = spawn('ls', ['-lh', '/usr']);
      // const ls = spawn('pwd');
      const unzip = spawn('unzip', [
        '-q', // quiet
        '-o', // overwrite
        '-d', // destination
        '/Users/terenz/Desktop/dist',
        `/Users/terenz/IdeaProjects/tus-node-server/demo/files/${fileName}`,
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
          clearInterval(timer);
          resolve('success');
        } else {
          clearInterval(timer);
          resolve('error');
          // todo implement exception handling
        }
      });

      unzip.on('disconnect', (code) => {
        console.log('disconnect');
        console.log(`child process exited with code ${code}`);
      });
    });
  }
}
