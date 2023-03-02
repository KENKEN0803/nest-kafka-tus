import { All, Controller, Req, Res } from '@nestjs/common';
import { TusService } from './tus.service';
import { TUS_URL_PRI_FIX } from '../lib/config/server.config';
import { Request, Response } from 'express';

@Controller()
export class StorageController {
  constructor(private tusService: TusService) {}

  @All(TUS_URL_PRI_FIX + '*')
  async tus(@Req() req: Request, @Res() res: Response) {
    return this.tusService.handleTus(req, res);
  }
}
