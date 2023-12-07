import { Controller } from '@nestjs/common';
import { CentersService } from './centers.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CENTER_MESSAGES } from '@app/rmq/rmq.center.constants';
import { CreateCenterDto } from '@app/database/dtos/centerDtos/createCenter.dto';
import { UpdateCenterDto } from '@app/database/dtos/centerDtos/updateCenter.dto';

@Controller()
export class CentersController {
  constructor(private readonly centersService: CentersService) {}

  @MessagePattern(CENTER_MESSAGES.createCenter)
  async createCenter(@Payload() data: CreateCenterDto) {
    return this.centersService.createCenter(data);
  }

  @MessagePattern(CENTER_MESSAGES.getAllCenters)
  async getAllCenters() {
    return this.centersService.getCenters();
  }

  @MessagePattern(CENTER_MESSAGES.getCenter)
  async getCenter(@Payload() id: number) {
    return this.centersService.getCenter(id);
  }
  @MessagePattern(CENTER_MESSAGES.deleteCenter)
  async deleteCenter(@Payload() id: number) {
    return this.centersService.deleteCenter(id);
  }
  @MessagePattern(CENTER_MESSAGES.updateCenter)
  async updateCenter(@Payload() UpdateCenterDto: UpdateCenterDto) {
    return this.centersService.updateCenter(UpdateCenterDto);
  }

  @MessagePattern(CENTER_MESSAGES.getCeterWithFrontId)
  async getCenterForTask(@Payload() frontIdDto: { frontId: number }) {
    return this.centersService.getCenterForTasks(frontIdDto);
  }
}
