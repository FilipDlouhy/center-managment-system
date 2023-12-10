import { Controller } from '@nestjs/common';
import { CentersService } from './centers.service';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { CENTER_MESSAGES } from '@app/rmq/rmq.center.constants';
import { CreateCenterDto } from '@app/database/dtos/centerDtos/createCenter.dto';
import { UpdateCenterDto } from '@app/database/dtos/centerDtos/updateCenter.dto';
import { Center } from '@app/database/entities/center.entity';

@Controller()
export class CentersController {
  constructor(private readonly centersService: CentersService) {}

  // Create a new center
  @MessagePattern(CENTER_MESSAGES.createCenter)
  async createCenter(@Payload() data: CreateCenterDto): Promise<Center> {
    try {
      return this.centersService.createCenter(data);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  // Get a list of all centers
  @MessagePattern(CENTER_MESSAGES.getAllCenters)
  async getAllCenters(): Promise<Center[]> {
    try {
      return this.centersService.getCenters();
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  // Get a center by its ID
  @MessagePattern(CENTER_MESSAGES.getCenter)
  async getCenter(@Payload() id: number): Promise<Center> {
    try {
      return this.centersService.getCenter(id);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  // Delete a center by its ID
  @MessagePattern(CENTER_MESSAGES.deleteCenter)
  async deleteCenter(@Payload() id: number): Promise<boolean> {
    try {
      return this.centersService.deleteCenter(id);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  // Update a center's information
  @MessagePattern(CENTER_MESSAGES.updateCenter)
  async updateCenter(
    @Payload() UpdateCenterDto: UpdateCenterDto,
  ): Promise<UpdateCenterDto> {
    try {
      return this.centersService.updateCenter(UpdateCenterDto);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  // Get a center by its associated front ID
  @MessagePattern(CENTER_MESSAGES.getCeterWithFrontId)
  async getCenterForTask(
    @Payload() frontIdDto: { frontId: number },
  ): Promise<any> {
    try {
      return this.centersService.getCenterForTasks(frontIdDto);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }
}
