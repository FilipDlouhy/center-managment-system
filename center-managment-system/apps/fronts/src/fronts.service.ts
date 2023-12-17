import { FrontDTO } from '@app/database/dtos/frontDtos/front.dto';
import { FrontUpdateTimeAndTasksDTO } from '@app/database/dtos/frontDtos/frontUpdateTimeAndTasks.dto';
import { UpdateLengthDTO } from '@app/database/dtos/frontDtos/updateLength.dto';
import { AddTaskToFrontDTO } from '@app/database/dtos/tasksDtos/addTaskToFront.dto';
import { Front } from '@app/database/entities/front.entity';
import { TASK_MESSAGES, TASK_QUEUE } from '@app/rmq/rmq.task.constants';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { frontLength } from '@app/database/length.constant';
import { EntityManager, Repository, Not } from 'typeorm';

@Injectable()
export class FrontsService {
  constructor(
    @InjectRepository(Front)
    private readonly frontRepository: Repository<Front>,
    private readonly entityManager: EntityManager,
    @Inject(TASK_QUEUE.serviceName)
    private readonly taskClient: ClientProxy,
  ) {}

  /**
   * Creates a new front.
   * @returns The created front data.
   * @throws InternalServerErrorException If there's an error during creation.
   */
  async createFront(): Promise<FrontDTO> {
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
  async getFronts(): Promise<Front[]> {
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
  async getFront(id: number): Promise<Front> {
    try {
      const front = await this.frontRepository.findOne({
        where: { id },
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
   * Deletes a front from the database and associated tasks.
   * @param id The ID of the front to delete.
   * @returns A boolean indicating whether the deletion was successful.
   * @throws NotFoundException If the front is not found.
   * @throws InternalServerErrorException If there's an error during deletion.
   */
  async deleteFront(id: number): Promise<boolean> {
    try {
      // Delete front from associated tasks first
      const deleteFrontFromTasks = await this.taskClient
        .send(TASK_MESSAGES.deleteFrontFromTasks, {
          frontId: id,
        })
        .toPromise();

      // Check if deleteFrontFromTasks was successful
      if (deleteFrontFromTasks === true) {
        const result = await this.frontRepository.delete(id);

        if (result.affected && result.affected > 0) {
          return true; // Both operations were successful
        } else {
          throw new NotFoundException('Front not found');
        }
      } else {
        throw new Error('Failed to delete front from tasks');
      }
    } catch (error) {
      console.error('Error while deleting front:', error);
      throw new InternalServerErrorException(
        'Error while deleting front: ' + error.message,
      );
    }
  }

  /**
   * Updates the maximum length of tasks for a front.
   * @param updateLengthDto Data Transfer Object containing the new maximum length.
   * @returns Boolean indicating success of the operation.
   * @throws NotFoundException If the front table is not found.
   * @throws InternalServerErrorException For any other unexpected errors.
   */
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

  /**
   * Retrieves the best front for assigning a task.
   * @returns The best suited front.
   */
  async getFrontForTask(): Promise<Front> {
    // Assuming 'frontRepository' is your repository object for the 'Front' entity
    const sortedFront = await this.frontRepository.find({
      where: { taskTotal: Not(frontLength) },
      order: {
        timeToCompleteAllTasks: 'ASC',
      },
      take: 1,
    });

    return sortedFront[0];
  }

  /**
   * Adds a task to a front and updates its total task count and time to complete.
   * @param frontUpdateObj Data Transfer Object for updating front.
   * @returns Boolean indicating success of the operation.
   * @throws BadRequestException If input data is invalid.
   * @throws NotFoundException If the front is not found.
   * @throws InternalServerErrorException For any other unexpected errors.
   */
  async addTaskToFront(frontUpdateObj: FrontUpdateTimeAndTasksDTO) {
    // Validate input
    if (
      !frontUpdateObj ||
      !frontUpdateObj.frontId ||
      frontUpdateObj.timeToCompleteTask == null
    ) {
      throw new BadRequestException('Invalid input data');
    }

    try {
      const updatedFront = await this.entityManager.transaction(
        async (transactionalEntityManager) => {
          const front = await this.frontRepository.findOne({
            where: { id: frontUpdateObj.frontId },
            select: ['id', 'timeToCompleteAllTasks', 'taskTotal', 'maxTasks'],
          });

          if (!front) {
            throw new NotFoundException('Front not found');
          }

          if (front.taskTotal + 1 > front.maxTasks) {
            throw new BadRequestException('Front full');
          }

          await this.updateFrontWithTaskInfo(
            front,
            1,
            frontUpdateObj.timeToCompleteTask,
            transactionalEntityManager,
          );

          return true;
        },
      );

      return updatedFront;
    } catch (error) {
      console.error('Error while updating front:', error);
      throw new InternalServerErrorException(
        'Error while updating front: ' + error.message,
      );
    }
  }

  /**
   * Deletes a task from a front and updates its total task count and time to complete.
   * @param frontLengthUpdateDto Data Transfer Object for updating front task length.
   * @returns Boolean indicating success of the operation.
   * @throws BadRequestException If input data is invalid.
   * @throws NotFoundException If the front is not found.
   * @throws InternalServerErrorException For any other unexpected errors.
   */
  async deleteFrontTaskLength(
    frontLengthUpdateDto: FrontUpdateTimeAndTasksDTO,
  ): Promise<boolean> {
    // Validate input
    if (
      !frontLengthUpdateDto ||
      !frontLengthUpdateDto.frontId ||
      frontLengthUpdateDto.timeToCompleteTask == null
    ) {
      throw new BadRequestException('Invalid input data');
    }

    try {
      const updatedFront = await this.entityManager.transaction(
        async (transactionalEntityManager) => {
          const front = await this.frontRepository.findOne({
            where: { id: frontLengthUpdateDto.frontId },
          });

          if (!front) {
            throw new NotFoundException('Front not found');
          }

          // Check for negative values
          if (
            front.timeToCompleteAllTasks <
              frontLengthUpdateDto.timeToCompleteTask ||
            front.taskTotal <= 0
          ) {
            throw new BadRequestException('Invalid task length or task count');
          }

          front.timeToCompleteAllTasks =
            front.timeToCompleteAllTasks -
            frontLengthUpdateDto.timeToCompleteTask;
          front.taskTotal = front.taskTotal - 1;
          await transactionalEntityManager.save(front);

          return true;
        },
      );
      return updatedFront;
    } catch (error) {
      console.error('Error while updating front task length:', error);
      throw new InternalServerErrorException(
        'Error while updating front task length: ' + error.message,
      );
    }
  }

  /**
   * Adds the best task to a front based on specific criteria.
   * @param frontUpdateTaskDto Data Transfer Object for updating front with the best task.
   * @returns Boolean indicating success of the operation.
   * @throws BadRequestException If input data is invalid.
   * @throws NotFoundException If the front is not found.
   * @throws InternalServerErrorException For any other unexpected errors.
   */
  async addBestTaskToFront(
    frontUpdateTaskDto: AddTaskToFrontDTO,
  ): Promise<boolean> {
    // Validate input
    if (
      !frontUpdateTaskDto ||
      !frontUpdateTaskDto.frontId ||
      frontUpdateTaskDto.processedAt == null
    ) {
      throw new BadRequestException('Invalid input data');
    }

    try {
      const updatedFront = await this.entityManager.transaction(
        async (transactionalEntityManager) => {
          const front = await this.frontRepository.findOne({
            where: { id: frontUpdateTaskDto.frontId },
          });

          if (!front) {
            throw new NotFoundException('Front not found');
          }

          await this.updateFrontWithTaskInfo(
            front,
            1,
            frontUpdateTaskDto.processedAt,
            transactionalEntityManager,
          );

          return true;
        },
      );
      return updatedFront;
    } catch (error) {
      console.error('Error in addBestTaskToFront:', error);
      throw new InternalServerErrorException(
        'Error occurred in addBestTaskToFront: ' + error.message,
      );
    }
  }

  /**
   * Updates the time to complete all tasks for a given front.
   *
   * @param frontUpdateObj - DTO containing the front ID and the additional time to complete the task.
   * @returns Promise<boolean> - Returns true if the operation was successful.
   */
  async updateFrontTimeToCompleteAllTasks(
    frontUpdateObj: FrontUpdateTimeAndTasksDTO,
  ): Promise<boolean> {
    try {
      await this.frontRepository
        .createQueryBuilder()
        .update()
        .set({
          timeToCompleteAllTasks: () =>
            `timeToCompleteAllTasks + ${frontUpdateObj.timeToCompleteTask}`,
        })
        .where('id = :id', { id: frontUpdateObj.frontId })
        .execute();

      return true;
    } catch (error) {
      console.error('Error updating time to complete tasks:', error);

      throw error;
    }
  }

  /**
   * Update the 'front' object with task-related information.
   * @param front The 'front' object to update.
   * @param taskCount The number of tasks to add to the 'taskTotal' property.
   * @param timeToAdd The time to add to the 'timeToCompleteAllTasks' property.
   */
  private async updateFrontWithTaskInfo(
    front: Front,
    taskCount: number,
    timeToAdd: number,
    transactionalEntityManager: EntityManager,
  ) {
    // Add to the 'taskTotal' and 'timeToCompleteAllTasks' properties of the 'front' object.
    front.taskTotal = front.taskTotal + taskCount;
    front.timeToCompleteAllTasks = front.timeToCompleteAllTasks + timeToAdd;

    // Save the updated 'front' object using the transactionalEntityManager.
    await transactionalEntityManager.save(front);
  }
}
