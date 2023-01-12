import { Controller, All, Req, Res, Patch } from '@nestjs/common';
import { TusService } from './tus.service';

@Controller()
export class StorageController {
  constructor(private tusService: TusService) {}

  @All('/files*')
  async tus(@Req() req, @Res() res) {
    return this.tusService.handleTus(req, res);
  }
}
