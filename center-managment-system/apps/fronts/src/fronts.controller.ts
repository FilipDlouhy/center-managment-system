import { Controller, Get } from '@nestjs/common';
import { FrontsService } from './fronts.service';

@Controller()
export class FrontsController {
  constructor(private readonly frontsService: FrontsService) {}

  @Get()
  getHello(): string {
    return this.frontsService.getHello();
  }
}
