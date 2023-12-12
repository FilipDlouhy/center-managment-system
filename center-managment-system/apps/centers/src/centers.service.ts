import { CreateCenterDto } from '@app/database/dtos/centerDtos/createCenter.dto';
import { Center } from '@app/database/entities/center.entity';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { FRONT_MESSAGES, FRONT_QUEUE } from '@app/rmq/rmq.front.constants';
import { UpdateCenterDto } from '@app/database/dtos/centerDtos/updateCenter.dto';
import * as amqp from 'amqplib';
import { SchedulerRegistry } from '@nestjs/schedule';
import { TASK_MESSAGES, TASK_QUEUE } from '@app/rmq/rmq.task.constants';
import { UpdateTaskStateDTO } from '@app/database/dtos/tasksDtos/updateTaskState.dto';
import { taskStatus } from '@app/database/dtos/tasksDtos/taskStatus';
import { AddTaskToFrontDTO } from '@app/database/dtos/tasksDtos/addTaskToFront.dto';
import { FrontUpdateTimeAndTasksDTO } from '@app/database/dtos/frontDtos/frontUpdateTimeAndTasks.dto';
@Injectable()
export class CentersService implements OnModuleInit {
  constructor(
    @InjectRepository(Center)
    private readonly centerRepository: Repository<Center>,
    private readonly entityManager: EntityManager,
    @Inject(FRONT_QUEUE.serviceName)
    private readonly frontClient: ClientProxy,
    @Inject(TASK_QUEUE.serviceName)
    private readonly taskClient: ClientProxy,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private exchange = 'center_exchange';
  async onModuleInit() {
    this.connection = await amqp.connect('amqp://localhost:5672');
    this.channel = await this.connection.createChannel();

    const centers = await this.getCenters();
    await this.channel.assertExchange(this.exchange, 'direct', {
      durable: true,
    });

    centers.forEach(async (center) => {
      await this.setupQueueForCenter(center.id.toString());
      await this.taskClient
        .send(TASK_MESSAGES.sendTaskToDoAfterRestart, {
          centerId: center.id,
          frontId: center.front.id,
        })
        .toPromise();
    });
  }

  /**
   * Consumes messages from a center queue and processes them.
   * @param centerId The ID of the center whose queue is being consumed.
   */
  private async setupQueueForCenter(centerId: string) {
    const queue = `${centerId}_queue`;

    // Attempt to create the queue
    try {
      await this.channel.assertQueue(queue, { durable: true });
      console.log(`Queue created: ${queue}`);

      // Bind the queue to the exchange
      await this.channel.bindQueue(
        queue,
        this.exchange,
        `center.${centerId}.task`,
      );
      console.log(`Queue bound to exchange: ${queue}`);

      // Start consuming messages from the queue
      await this.consumeMessagesFromCenter(centerId);
    } catch (error) {
      console.error(`Error setting up queue for center ${centerId}:`, error);
    }
  }

  /**
   * Consumes messages from a specific message queue associated with a center.
   *
   * @param centerId - The ID of the center whose messages are being consumed.
   */
  private async consumeMessagesFromCenter(centerId: string) {
    const queueName = `${centerId}_queue`;
    // Start consuming messages from the queue
    await this.channel.consume(queueName, async (msg) => {
      // Check if a message is received
      if (!msg) {
        console.warn(`No message received from ${queueName}`);
        return;
      }

      // Parse the message content from the queue
      const messageContent = JSON.parse(msg.content.toString());
      console.log(`Received message from ${queueName}:`, messageContent);

      // Process the message after a delay based on 'processedAt' time
      const establishWsTimeout = setTimeout(async () => {
        try {
          // Update task state to DONE using the data received in the message
          const taskUpdateDto = new UpdateTaskStateDTO(
            messageContent.id,
            taskStatus.DONE,
            messageContent.frontId,
          );
          await this.taskClient
            .send(TASK_MESSAGES.updateTaskState, taskUpdateDto)
            .toPromise();

          // Update the length of tasks in the front specified in the message
          const frontUpdateDto = new FrontUpdateTimeAndTasksDTO(
            messageContent.frontId,
            messageContent.processedAt,
          );
          await this.frontClient
            .send(FRONT_MESSAGES.deleteFrontTaskLength, frontUpdateDto)
            .toPromise();

          // Handle selecting the best task for the front
          const bestTaskForFront = await this.taskClient
            .send(TASK_MESSAGES.getBestTaskForFront, {})
            .toPromise();

          // If a best task is found, schedule it for the front
          if (bestTaskForFront != null) {
            const taskToFrontDto = new AddTaskToFrontDTO(
              bestTaskForFront.id,
              taskStatus.SCHEDULED,
              bestTaskForFront.processedAt,
              messageContent.frontId,
            );
            await this.frontClient
              .send(FRONT_MESSAGES.addBestTaskToFront, taskToFrontDto)
              .toPromise();
            await this.taskClient
              .send(TASK_MESSAGES.addFrontToTask, taskToFrontDto)
              .toPromise();
          }

          // Find the next task to do in the specified front
          await this.taskClient
            .send(TASK_MESSAGES.findNextTaskToDoInFront, {
              frontId: messageContent.frontId,
            })
            .toPromise();
        } catch (error) {
          console.error('Error processing message from center:', error);
        }
      }, messageContent.processedAt);

      // Add the task processing to the scheduler registry
      this.schedulerRegistry.addTimeout(
        `${messageContent.id}_establish_ws`,
        establishWsTimeout,
      );

      // Acknowledge the message so it is not sent again
      this.channel.ack(msg);
    });
  }

  /**
   * Creates a new center.
   * @param centerData Data for creating a new center.
   * @returns The created center.
   * @throws InternalServerErrorException If there's an error during creation.
   */
  async createCenter(centerData: CreateCenterDto): Promise<Center> {
    try {
      const front = await this.frontClient
        .send(FRONT_MESSAGES.frontCreate, {})
        .toPromise();

      const centerDto = new CreateCenterDto({
        name: centerData.name,
        frontId: front.id,
      });

      const center = new Center({ ...centerDto, front });
      const savedCenter = await this.entityManager.save(center);
      this.setupQueueForCenter(savedCenter.id.toString());
      return savedCenter;
    } catch (error) {
      console.error(error);
      throw new RpcException('Error while creating center: ' + error.message);
    }
  }

  /**
   * Retrieves all centers.
   * @returns A list of centers.
   * @throws InternalServerErrorException If there's an error during retrieval.
   */
  async getCenters(): Promise<Center[]> {
    try {
      return await this.centerRepository.find({
        relations: ['front', 'front.tasks'],
      });
    } catch (error) {
      console.error('An error occurred while fetching centers:', error);
      throw new RpcException('Error while fetching centers: ' + error.message);
    }
  }

  /**
   * Retrieves a single center by ID.
   * @param id The ID of the center.
   * @returns The requested center.
   * @throws NotFoundException If the center is not found.
   * @throws InternalServerErrorException If there's an error during retrieval.
   */
  async getCenter(id: number): Promise<Center> {
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
      throw new RpcException(
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
        throw new RpcException('Center not found');
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

  /**
   * Retrieves the center for tasks associated with a specific front.
   * @param frontIdDto DTO containing the front ID.
   * @returns The center associated with the given front ID.
   */
  async getCenterForTasks(frontIdDto: { frontId: number }): Promise<any> {
    const frontId = frontIdDto.frontId;
    const center = await this.centerRepository
      .createQueryBuilder('center')
      .leftJoinAndSelect('center.front', 'front')
      .where('front.id = :frontId', { frontId })
      .select(['center.id']) // Select only the centerId
      .getRawOne(); // Use getRawOne to get a plain object

    return center;
  }
}
