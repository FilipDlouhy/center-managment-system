import { CreateCenterDto } from '@app/database/dtos/centerDtos/createCenter.dto';
import { Center } from '@app/database/entities/center.entity';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { FRONT_MESSAGES, FRONT_QUEUE } from '@app/rmq/rmq.front.constants';
import { UpdateCenterDto } from '@app/database/dtos/centerDtos/updateCenter.dto';

@Injectable()
export class CentersService {
  constructor(
    @InjectRepository(Center)
    private readonly centerRepository: Repository<Center>,
    private readonly entityManager: EntityManager,
    @Inject(FRONT_QUEUE.serviceName)
    private readonly frontClient: ClientProxy, // rabbitMq client
  ) {}

  /**
   * Creates a new center.
   * @param centerData Data for creating a new center.
   * @returns The created center.
   * @throws InternalServerErrorException If there's an error during creation.
   */
  async createCenter(centerData: CreateCenterDto) {
    try {
      const front = await this.frontClient
        .send(FRONT_MESSAGES.frontCreate, {})
        .toPromise();

      const centerDto = new CreateCenterDto({
        name: centerData.name,
        frontId: front.id,
      });

      const center = new Center({ ...centerDto, front });
      return await this.entityManager.save(center);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Error while creating center: ' + error.message,
      );
    }
  }

  /**
   * Retrieves all centers.
   * @returns A list of centers.
   * @throws InternalServerErrorException If there's an error during retrieval.
   */
  async getCenters() {
    try {
      return await this.centerRepository.find({
        relations: ['front', 'front.tasks'],
      });
    } catch (error) {
      console.error('An error occurred while fetching centers:', error);
      throw new InternalServerErrorException(
        'Error while fetching centers: ' + error.message,
      );
    }
  }

  /**
   * Retrieves a single center by ID.
   * @param id The ID of the center.
   * @returns The requested center.
   * @throws NotFoundException If the center is not found.
   * @throws InternalServerErrorException If there's an error during retrieval.
   */
  async getCenter(id: number) {
    try {
      const center = await this.centerRepository.findOne({
        where: { id },
        relations: ['front', 'front.tasks'],
      });

      if (!center) {
        throw new NotFoundException('Center not found');
      }

      return center;
    } catch (error) {
      console.error('An error occurred while fetching the center:', error);
      throw new InternalServerErrorException(
        'Error while fetching the center: ' + error.message,
      );
    }
  }

  /**
   * Deletes a center from the database.
   * @param id The ID of the center to delete.
   * @returns A boolean indicating whether the deletion was successful.
   * @throws NotFoundException If the center is not found or front deletion fails.
   * @throws InternalServerErrorException If there's an error during deletion.
   */
  async deleteCenter(id: number): Promise<boolean> {
    try {
      const center = await this.centerRepository.findOne({
        where: { id },
        relations: ['front'],
      });

      if (!center) {
        throw new NotFoundException('Center not found');
      }

      const deleteResult = await this.centerRepository.delete(id);
      if (deleteResult.affected && deleteResult.affected > 0) {
        const isFrontDeleted = await this.frontClient
          .send(FRONT_MESSAGES.deleteFront, center.front.id)
          .toPromise();

        if (!isFrontDeleted) {
          throw new NotFoundException('Failed to delete front data');
        }

        return true;
      } else {
        throw new NotFoundException('Center not found');
      }
    } catch (error) {
      console.error('Error while deleting center:', error);
      throw new InternalServerErrorException(
        'Error while deleting center: ' + error.message,
      );
    }
  }

  /**
   * Updates a center's information in the database.
   * @param updateCenterDto The DTO containing the updated center information.
   * @returns The updated center DTO if the update was successful.
   * @throws BadRequestException If the provided center ID is invalid.
   * @throws NotFoundException If the center is not found.
   * @throws InternalServerErrorException If there's an error during the update.
   */
  async updateCenter(
    updateCenterDto: UpdateCenterDto,
  ): Promise<UpdateCenterDto> {
    try {
      // Check if the provided center ID is a valid positive number
      if (isNaN(updateCenterDto.id) || updateCenterDto.id <= 0) {
        throw new BadRequestException('Invalid center ID');
      }

      // Find the center in the database along with related entities
      const updatedCenter = await this.entityManager.transaction(
        async (transactionalEntityManager) => {
          const center = await this.centerRepository.findOne({
            where: { id: updateCenterDto.id },
            relations: ['front', 'front.tasks'],
          });

          // Check if the center exists
          if (!center) {
            throw new NotFoundException('Center not found');
          }

          // Update the center's name if provided
          if (updateCenterDto.name && updateCenterDto.name.length > 0) {
            center.name = updateCenterDto.name;
          }

          // Save the updated center
          await transactionalEntityManager.save(center);

          return center;
        },
      );

      return updatedCenter;
    } catch (error) {
      console.error('Error while updating center:', error);

      throw new InternalServerErrorException(
        'Error while updating center: ' + error.message,
      );
    }
  }
}
