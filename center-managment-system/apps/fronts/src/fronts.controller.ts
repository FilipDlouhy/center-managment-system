import { Controller } from '@nestjs/common';
import { FrontsService } from './fronts.service';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { FRONT_MESSAGES } from '@app/rmq/rmq.front.constants';
import { UpdateLengthDTO } from '@app/database/dtos/frontDtos/updateLength.dto';
import { FrontUpdateTimeAndTasksDTO } from '@app/database/dtos/frontDtos/frontUpdateTimeAndTasks.dto';
import { AddTaskToFrontDTO } from '@app/database/dtos/tasksDtos/addTaskToFront.dto';
import { FrontDTO } from '@app/database/dtos/frontDtos/front.dto';
import { Front } from '@app/database/entities/front.entity';

@Controller()
export class FrontsController {
  constructor(private readonly frontsService: FrontsService) {}

  // Create a new front
  @MessagePattern(FRONT_MESSAGES.frontCreate)
  async createFront(): Promise<FrontDTO> {
    try {
      return await this.frontsService.createFront();
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  // Get a list of all fronts
  @MessagePattern(FRONT_MESSAGES.getAllFronts)
  async getAllFronts(): Promise<Front[]> {
    try {
      return await this.frontsService.getFronts();
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  // Get a front by its ID
  @MessagePattern(FRONT_MESSAGES.getFront)
  async getFront(id: number): Promise<Front> {
    try {
      return await this.frontsService.getFront(id);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  // Delete a front by its ID
  @MessagePattern(FRONT_MESSAGES.deleteFront)
  async deleteFront(id: number): Promise<boolean> {
    try {
      return await this.frontsService.deleteFront(id);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  // Update the length of a front
  @MessagePattern(FRONT_MESSAGES.updateFrontLength)
  async updateFrontLength(updateLengthDto: UpdateLengthDTO): Promise<boolean> {
    try {
      return await this.frontsService.updateMaximumFrontLength(updateLengthDto);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  // Get a front for a task
  @MessagePattern(FRONT_MESSAGES.getFrontForTask)
  async getFrontForTask(): Promise<Front> {
    try {
      return await this.frontsService.getFrontForTask();
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  // Add a task's length to a front
  @MessagePattern(FRONT_MESSAGES.addFrontTasksLength)
  async addTaskToFront(
    @Payload() frontUpdateObj: FrontUpdateTimeAndTasksDTO,
  ): Promise<boolean> {
    try {
      return await this.frontsService.addTaskToFront(frontUpdateObj);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  // Delete a task's length from a front
  @MessagePattern(FRONT_MESSAGES.deleteFrontTaskLength)
  async deleteFrontTaskLength(
    @Payload() frontUpdateObj: FrontUpdateTimeAndTasksDTO,
  ): Promise<boolean> {
    try {
      return await this.frontsService.deleteFrontTaskLength(frontUpdateObj);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  // Add the best task to a front
  @MessagePattern(FRONT_MESSAGES.addBestTaskToFront)
  async addBestTaskToFront(
    @Payload() frontUpdateTask: AddTaskToFrontDTO,
  ): Promise<boolean> {
    try {
      return await this.frontsService.addBestTaskToFront(frontUpdateTask);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }
}
