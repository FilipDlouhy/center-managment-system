import { FrontDTO } from '@app/database/dtos/frontDtos/front.dto';
import { UpdateLengthDTO } from '@app/database/dtos/frontDtos/updateLength.dto';
import { Front } from '@app/database/entities/front.entity';
import { frontLength } from '@app/database/front.length.constant';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class FrontsService {
  constructor(
    @InjectRepository(Front)
    private readonly frontRepository: Repository<Front>,
    private readonly entityManager: EntityManager,
  ) {}

  /**
   * Creates a new front.
   * @returns The created front data.
   * @throws InternalServerErrorException If there's an error during creation.
   */
  async createFront() {
    try {
      const frontData = {
        maxTasks: frontLength,
      };

      const frontDto = new FrontDTO(frontData);
      const front = new Front(frontDto);
      await this.entityManager.save(front);

      return frontDto;
    } catch (error) {
      console.error('An error occurred while creating the front:', error);
      throw new InternalServerErrorException(
        'Error while creating front: ' + error.message,
      );
    }
  }

  /**
   * Retrieves all fronts.
   * @returns A list of all fronts.
   * @throws InternalServerErrorException If there's an error during retrieval.
   */
  async getFronts() {
    try {
      return await this.frontRepository.find({
        relations: { tasks: true },
      });
    } catch (error) {
      console.error('An error occurred while fetching fronts:', error);
      throw new InternalServerErrorException(
        'Error while fetching fronts: ' + error.message,
      );
    }
  }

  /**
   * Retrieves a single front by ID.
   * @param id The ID of the front.
   * @returns The requested front.
   * @throws NotFoundException If the front is not found.
   * @throws InternalServerErrorException If there's an error during retrieval.
   */
  async getFront(id: number) {
    try {
      const front = await this.frontRepository.findOne({
        where: { id },
        relations: ['front', 'front.tasks'],
      });

      if (!front) {
        throw new NotFoundException('Front not found');
      }

      return front;
    } catch (error) {
      console.error('An error occurred while fetching the front:', error);
      throw new InternalServerErrorException(
        'Error while fetching the front: ' + error.message,
      );
    }
  }

  /**
   * Deletes a front from the database.
   * @param id The ID of the front to delete.
   * @returns A boolean indicating whether the deletion was successful.
   * @throws NotFoundException If the front is not found.
   * @throws InternalServerErrorException If there's an error during deletion.
   */
  async deleteFront(id: number) {
    try {
      const result = await this.frontRepository.delete(id);

      if (result.affected && result.affected > 0) {
        return true;
      } else {
        throw new NotFoundException('Front not found');
      }
    } catch (error) {
      console.error('Error while deleting front:', error);
      throw new InternalServerErrorException(
        'Error while deleting front: ' + error.message,
      );
    }
  }

  async updateMaximumFrontLength(
    updateLengthDto: UpdateLengthDTO,
  ): Promise<boolean> {
    try {
      // Create a query builder to update the front table
      await this.frontRepository
        .createQueryBuilder()
        .update(Front)
        .set({ maxTasks: updateLengthDto.maximumFrontLength })
        .execute();
      return true;
    } catch (error) {
      console.error('Error while updating front length:', error);

      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new NotFoundException('Front table not found');
      }

      throw new InternalServerErrorException(
        'Error while updating front length: ' + error.message,
      );
    }
  }
}
