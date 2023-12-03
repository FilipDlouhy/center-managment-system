import { Module } from '@nestjs/common';
import { CentersController } from './centers.controller';
import { CentersService } from './centers.service';

@Module({
  imports: [],
  controllers: [CentersController],
  providers: [CentersService],
})
export class CentersModule {}
