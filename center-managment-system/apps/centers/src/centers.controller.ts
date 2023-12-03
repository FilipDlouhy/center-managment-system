import { Controller, Get } from '@nestjs/common';
import { CentersService } from './centers.service';

@Controller()
export class CentersController {
  constructor(private readonly centersService: CentersService) {}

  @Get()
  getHello(): string {
    return this.centersService.getHello();
  }
}
