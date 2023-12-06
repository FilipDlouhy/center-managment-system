import { Controller } from '@nestjs/common';
import { FrontsService } from './fronts.service';
import { MessagePattern } from '@nestjs/microservices';
import { FRONT_MESSAGES } from '@app/rmq/rmq.front.constants';
import { UpdateLengthDTO } from '@app/database/dtos/frontDtos/updateLength.dto';

@Controller()
export class FrontsController {
  constructor(private readonly frontsService: FrontsService) {}

  @MessagePattern(FRONT_MESSAGES.frontCreate)
  async createFront() {
    return this.frontsService.createFront();
  }

  @MessagePattern(FRONT_MESSAGES.getAllFronts)
  async getAllFronts() {
    return this.frontsService.getFronts();
  }

  @MessagePattern(FRONT_MESSAGES.getFront)
  async getFront(id: number) {
    return this.frontsService.getFront(id);
  }

  @MessagePattern(FRONT_MESSAGES.deleteFront)
  async deleteFront(id: number) {
    return this.frontsService.deleteFront(id);
  }

  @MessagePattern(FRONT_MESSAGES.updateFrontLength)
  async updateFrontLength(updateLengthDto: UpdateLengthDTO) {
    return this.frontsService.updateMaximumFrontLength(updateLengthDto);
  }

  @MessagePattern(FRONT_MESSAGES.getFrontForTask)
  async getFrontForTask() {
    return this.frontsService.getFrontForTask();
  }
}
