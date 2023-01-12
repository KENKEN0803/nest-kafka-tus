import { All, Controller, Req, Res } from '@nestjs/common';
import { TusService } from './tus.service';
import * as HTTP from 'http';
import { TUS_URL_PRI_FIX } from '../config/server.config';

@Controller()
export class StorageController {
  constructor(private tusService: TusService) {}

  @All(TUS_URL_PRI_FIX + '*')
  async tus(@Req() req: HTTP.IncomingMessage, @Res() res: HTTP.ServerResponse) {
    return this.tusService.handleTus(req, res);
  }
}
