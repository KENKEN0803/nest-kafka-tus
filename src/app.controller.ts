import { Controller, Get, Inject, Query } from '@nestjs/common';
import { AppService } from './app.service';
import {
  ClientKafka,
  Ctx,
  KafkaContext,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('KAFKA_CLIENT_MODULE') private readonly kafkaClient: ClientKafka,
  ) {}

  onModuleInit() {
    this.kafkaClient.subscribeToResponseOf('test');
  }

  // @Get('/unzip')
  // async getHello(@Query('fileName') fileName: string): Promise<string> {
  //   return await this.appService.unZipFunc(fileName);
  // }

  @Get('/sendToKafka')
  async sendToKafka() {
    this.appService.sendToKafka();
    return 'sendToKafka';
  }

  @MessagePattern('test')
  async test(@Payload() data, @Ctx() kafkaContext: KafkaContext) {
    console.log('message received', data);
    // send heartbeat

    await this.appService.unZipFunc(data, kafkaContext);
    // await sleep(1000);
    // console.log(new Date().toLocaleTimeString());
    // console.log("@MessagePattern('test')");
    // console.log(context);
    // console.log(data);
    // return 'test';
  }
}

const sleep = async (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
