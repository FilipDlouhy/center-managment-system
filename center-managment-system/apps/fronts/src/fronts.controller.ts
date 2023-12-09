import { Controller } from '@nestjs/common';
import { FrontsService } from './fronts.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FRONT_MESSAGES } from '@app/rmq/rmq.front.constants';
import { UpdateLengthDTO } from '@app/database/dtos/frontDtos/updateLength.dto';
import { FrontUpdateTimeAndTasksDTO } from '@app/database/dtos/frontDtos/frontUpdateTimeAndTasks.dto';
import { AddTaskToFrontDTO } from '@app/database/dtos/tasksDtos/addTaskToFront.dto';

@Controller()
export class FrontsController {
  constructor(private readonly frontsService: FrontsService) {}

  // Create a new front
  @MessagePattern(FRONT_MESSAGES.frontCreate)
  async createFront() {
    return await this.frontsService.createFront();
  }

  // Get a list of all fronts
  @MessagePattern(FRONT_MESSAGES.getAllFronts)
  async getAllFronts() {
    return await this.frontsService.getFronts();
  }

  // Get a front by its ID
  @MessagePattern(FRONT_MESSAGES.getFront)
  async getFront(id: number) {
    return await this.frontsService.getFront(id);
  }

  // Delete a front by its ID
  @MessagePattern(FRONT_MESSAGES.deleteFront)
  async deleteFront(id: number) {
    return await this.frontsService.deleteFront(id);
  }

  // Update the length of a front
  @MessagePattern(FRONT_MESSAGES.updateFrontLength)
  async updateFrontLength(updateLengthDto: UpdateLengthDTO) {
    return await this.frontsService.updateMaximumFrontLength(updateLengthDto);
  }

  // Get a front for a task
  @MessagePattern(FRONT_MESSAGES.getFrontForTask)
  async getFrontForTask() {
    return await this.frontsService.getFrontForTask();
  }

  // Add a task's length to a front
  @MessagePattern(FRONT_MESSAGES.addFrontTasksLength)
  async addTaskToFront(@Payload() frontUpdateObj: FrontUpdateTimeAndTasksDTO) {
    return await this.frontsService.addTaskToFront(frontUpdateObj);
  }

  // Delete a task's length from a front
  @MessagePattern(FRONT_MESSAGES.deleteFrontTaskLength)
  async deleteFrontTaskLength(
    @Payload() frontUpdateObj: FrontUpdateTimeAndTasksDTO,
  ) {
    return await this.frontsService.deleteFrontTaskLength(frontUpdateObj);
  }

  // Add the best task to a front
  @MessagePattern(FRONT_MESSAGES.addBestTaskToFront)
  async addBestTaskToFront(@Payload() frontUpdateTask: AddTaskToFrontDTO) {
    return await this.frontsService.addBestTaskToFront(frontUpdateTask);
  }
}
