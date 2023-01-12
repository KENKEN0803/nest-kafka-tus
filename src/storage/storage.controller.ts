import { Controller, All, Req, Res, Patch } from '@nestjs/common';
import { TusService } from './tus.service';
import * as HTTP from 'http';

@Controller()
export class StorageController {
  constructor(private tusService: TusService) {}

  @All('/files*')
  async tus(@Req() req: HTTP.IncomingMessage, @Res() res: HTTP.ServerResponse) {
    return this.tusService.handleTus(req, res);
  }
}
