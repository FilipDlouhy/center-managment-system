import { Module } from '@nestjs/common';
import { FrontsController } from './fronts.controller';
import { FrontsService } from './fronts.service';

@Module({
  imports: [],
  controllers: [FrontsController],
  providers: [FrontsService],
})
export class FrontsModule {}
