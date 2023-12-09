import { FrontUpdateTimeAndTasksDTO } from '@app/database/dtos/frontDtos/frontUpdateTimeAndTasks.dto';
import { CreateTaskDto } from '@app/database/dtos/tasksDtos/createTask.dto';
import { Front } from '@app/database/entities/front.entity';
import { Task } from '@app/database/entities/task.entity';
import { User } from '@app/database/entities/user.entity';
import { USER_MESSAGES, USER_QUEUE } from '@app/rmq';
import { CENTER_MESSAGES, CENTER_QUEUE } from '@app/rmq/rmq.center.constants';
import { FRONT_MESSAGES, FRONT_QUEUE } from '@app/rmq/rmq.front.constants';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import * as amqp from 'amqplib';
import { taskStatus } from '@app/database/dtos/tasksDtos/taskStatus';
import { UpdateTaskStateDTO } from '@app/database/dtos/tasksDtos/updateTaskState.dto';
import { AddTaskToFrontDTO } from '@app/database/dtos/tasksDtos/addTaskToFront.dto';
import { TaskToDoDTO } from '@app/database/dtos/tasksDtos/taskToDo.dto';

@Injectable()
export class TasksService implements OnModuleInit {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly entityManager: EntityManager,
    @Inject(FRONT_QUEUE.serviceName)
    private readonly frontClient: ClientProxy,
    @Inject(USER_QUEUE.serviceName)
    private readonly userClient: ClientProxy,
    @Inject(CENTER_QUEUE.serviceName)
    private readonly centerClient: ClientProxy,
  ) {}
  async onModuleInit() {
    const connection = await amqp.connect('amqp://localhost:5672');
    this.channel = await connection.createChannel();
  }

  private channel: amqp.Channel;
  private exchange = 'center_exchange';

  private async sendMessageToCenter(centerId: string, messageObject: any) {
    try {
      const queue = `${centerId}_queue`;
      const message = JSON.stringify(messageObject);
      await this.channel.publish(
        this.exchange,
        `center.${centerId}.task`,
        Buffer.from(message),
      );
      console.log(`Message sent to queue ${queue}`);
    } catch (error) {
      console.error(`Error sending message to center ${centerId}:`, error);
    }
  }

  /**
   * Creates a new task.
   * @param createTaskDto Data Transfer Object for task creation.
   * @returns The created task entity.
   * @throws NotFoundException If the required front or user is not found.
   * @throws InternalServerErrorException For any other unexpected errors.
   */
  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    // Retrieve the Front object using the client proxy
    const timeToCompleteTask = this.generateRandomTime(1);

    const front: Front = await this.frontClient
      .send(FRONT_MESSAGES.getFrontForTask, {})
      .toPromise();

    if (!front) {
      throw new Error('Front not found');
    }

    if (front.taskTotal + 1 > front.maxTasks) {
      const newTaskDto = new CreateTaskDto(
        createTaskDto,
        null,
        timeToCompleteTask,
        taskStatus.UNSCHEDULED,
      );
      const user: User = await this.userClient
        .send(USER_MESSAGES.getUserForTask, { userId: createTaskDto.userId })
        .toPromise();
      const newTask = this.taskRepository.create({
        ...newTaskDto,
        user,
        whenAddedToTheFront: null,
      });

      const savedTask = await this.taskRepository.save(newTask);

      return savedTask;
    } else {
      const updateFrontTaskLengthAndTimeDto: FrontUpdateTimeAndTasksDTO =
        new FrontUpdateTimeAndTasksDTO(front.id, timeToCompleteTask);

      const wasFrontUpdated: boolean = await this.frontClient
        .send(
          FRONT_MESSAGES.addFrontTasksLength,
          updateFrontTaskLengthAndTimeDto,
        )
        .toPromise();

      if (wasFrontUpdated) {
        const user: User = await this.userClient
          .send(USER_MESSAGES.getUserForTask, { userId: createTaskDto.userId })
          .toPromise();

        // Save the new Task entity
        const newTaskDto = new CreateTaskDto(
          createTaskDto,
          front.id,
          timeToCompleteTask,
          taskStatus.SCHEDULED,
        );

        const newTask = this.taskRepository.create({
          ...newTaskDto,
          front: front,
          user,
          whenAddedToTheFront: new Date(),
        });
        if (front.taskTotal === 0) {
          const { center_id } = await this.centerClient
            .send(CENTER_MESSAGES.getCeterWithFrontId, { frontId: front.id })
            .toPromise();
          console.log(center_id);

          this.sendMessageToCenter(center_id, newTaskDto);
        }

        const savedTask = await this.taskRepository.save(newTask);

        return savedTask;
      }
    }
  }

  /**
   * Deletes a task by its ID.
   * @param id The ID of the task to be deleted.
   * @returns Boolean indicating success of the operation.
   * @throws NotFoundException If the task is not found.
   * @throws InternalServerErrorException For any other unexpected errors.
   */
  async deleteTask(id: number) {
    try {
      const result = await this.taskRepository.delete(id);

      if (result.affected && result.affected > 0) {
        return true;
      } else {
        throw new NotFoundException('User not found');
      }
    } catch (error) {
      console.error('Error while deleting user:', error);

      throw new InternalServerErrorException(
        'Error while deleting user: ' + error.message,
      );
    }
  }

  /**
   * Retrieves all tasks.
   * @returns An array of task entities.
   * @throws InternalServerErrorException If no tasks are found or in case of an error.
   */
  async getAllTasks() {
    try {
      const tasks = await this.taskRepository.find({
        select: ['id', 'processedAt', 'createdAt', 'status', 'description'],
      });

      if (!tasks) {
        throw new InternalServerErrorException('No users found');
      }

      return tasks;
    } catch (error) {
      console.error('Error while finding users:', error);

      throw new InternalServerErrorException('Error while finding users');
    }
  }

  /**
   * Retrieves a specific task by its ID.
   * @param id The ID of the task to retrieve.
   * @returns The requested task entity.
   * @throws NotFoundException If the task is not found.
   * @throws BadRequestException If the provided ID is invalid.
   * @throws InternalServerErrorException For any other unexpected errors.
   */
  async getTask(id: number) {
    try {
      if (isNaN(id) || id <= 0) {
        throw new BadRequestException('Invalid user ID');
      }

      const task = await this.taskRepository.findOne({
        where: { id },
        relations: { front: true, user: true },
        select: ['id', 'processedAt', 'createdAt', 'status', 'description'],
      });
      const dtoTest = new CreateTaskDto(
        task,
        task.front.id,
        task.processedAt,
        task.status,
      );

      dtoTest.userId = task.user.id;
      console.log(dtoTest);
      if (!task) {
        throw new NotFoundException('User not found');
      }

      return task;
    } catch (error) {
      console.error('Error while finding user:', error);

      throw new InternalServerErrorException('Error while finding user');
    }
  }

  /**
   * Updates the state of a task.
   * @param updateTaskStateDto Data Transfer Object for updating task state.
   * @returns Boolean indicating success of the operation.
   * @throws NotFoundException If the task is not found.
   * @throws InternalServerErrorException For any other unexpected errors.
   */
  async updateTaskState(updateTaskStateDto: UpdateTaskStateDTO) {
    if (
      !updateTaskStateDto ||
      !updateTaskStateDto.id ||
      !updateTaskStateDto.status
    ) {
      throw new BadRequestException('Invalid input data');
    }

    try {
      const wasTaskUpdated = await this.entityManager.transaction(
        async (transactionalEntityManager) => {
          // Check if task exists
          const existingTask = await this.taskRepository.findOne({
            where: { id: updateTaskStateDto.id },
          });

          if (!existingTask) {
            throw new NotFoundException(
              `Task with ID ${updateTaskStateDto.id} not found`,
            );
          }

          existingTask.status = updateTaskStateDto.status;
          if (existingTask.status === taskStatus.DONE) {
            existingTask.front = null;
          }

          await transactionalEntityManager.save(existingTask);

          return true;
        },
      );

      return wasTaskUpdated;
    } catch (error) {
      console.error('Error while updating task:', error);
      throw new InternalServerErrorException(
        'Error while updating task: ' + error.message,
      );
    }
  }

  /**
   * Retrieves the best task for a front based on criteria.
   * @returns The task entity that best fits the criteria.
   * @throws InternalServerErrorException If no suitable task is found or in case of an error.
   */
  async getBestTaskForFront() {
    try {
      const bestTaskForFront = await this.taskRepository.findOne({
        where: {
          status: 'unscheduled',
          whenAddedToTheFront: null,
        },
        order: {
          createdAt: 'ASC', // earliest first
          processedAt: 'ASC', // smallest processedAt value
        },
        select: ['id', 'status', 'createdAt', 'processedAt'], // selecting necessary fields
      });

      if (!bestTaskForFront) {
        return null; // Return null if no task is found
      }

      return bestTaskForFront;
    } catch (error) {
      console.error('Error in getBestTaskForFront:', error);
      throw new InternalServerErrorException(
        'An error occurred in getBestTaskForFront',
      );
    }
  }

  /**
   * Associates a front with a task.
   * @param taskToAdd Data Transfer Object for adding a front to a task.
   * @returns Boolean indicating success of the operation.
   * @throws NotFoundException If the task or front is not found.
   * @throws InternalServerErrorException For any other unexpected errors.
   */
  async addFrontToTask(taskToAdd: AddTaskToFrontDTO) {
    // Validate input
    if (!taskToAdd || !taskToAdd.id || !taskToAdd.frontId) {
      throw new BadRequestException('Invalid input data');
    }

    try {
      const wasTaskUpdated = await this.entityManager.transaction(
        async (transactionalEntityManager) => {
          const updatedTask = await this.taskRepository.findOne({
            where: { id: taskToAdd.id },
            select: ['id', 'whenAddedToTheFront', 'status'],
            relations: { front: true },
          });

          if (!updatedTask) {
            throw new NotFoundException(
              `Task with ID ${taskToAdd.id} not found`,
            );
          }

          const front = await this.frontClient
            .send(FRONT_MESSAGES.getFront, taskToAdd.frontId)
            .toPromise();

          if (!front) {
            throw new NotFoundException(
              `Front with ID ${taskToAdd.frontId} not found`,
            );
          }

          updatedTask.status = taskStatus.SCHEDULED;
          updatedTask.front = front;
          updatedTask.whenAddedToTheFront = new Date();
          await transactionalEntityManager.save(updatedTask);

          return true;
        },
      );

      return wasTaskUpdated;
    } catch (error) {
      console.error('Error while updating task with front:', error);
      throw new InternalServerErrorException(
        'Error while updating task with front: ' + error.message,
      );
    }
  }

  /**
   * Finds the next task to do in a front.
   * @param frontId The ID of the front.
   * @returns The task entity to be done next in the specified front.
   * @throws NotFoundException If no scheduled task is found for the front.
   * @throws BadRequestException If the provided front ID is invalid.
   * @throws InternalServerErrorException For any other unexpected errors.
   */
  async findNextTaskToDoInFront(frontId: number) {
    // Validate input
    if (!frontId) {
      throw new BadRequestException('Invalid front ID');
    }

    try {
      const updatedTask = await this.taskRepository.findOne({
        where: {
          front: { id: frontId },
          status: 'scheduled',
        },
        relations: ['user', 'front'],
        order: {
          whenAddedToTheFront: 'ASC',
        },
      });

      console.log('findNextTaskToDoInFront - Task Retrieved:', updatedTask);

      if (!updatedTask) {
        console.log(`No scheduled task found for front ID: ${frontId}`);
        return null;
      }

      updatedTask.status = taskStatus.DOING;

      const { center_id } = await this.centerClient
        .send(CENTER_MESSAGES.getCeterWithFrontId, { frontId })
        .toPromise();

      const newTaskToDo = new TaskToDoDTO(
        updatedTask.id,
        updatedTask.description,
        updatedTask.status,
        updatedTask.createdAt,
        updatedTask.processedAt,
        updatedTask.user.id,
        frontId,
      );
      newTaskToDo.userId = updatedTask.user.id;
      console.log('New Task to Do:', newTaskToDo);

      await this.sendMessageToCenter(center_id, newTaskToDo);
      await this.taskRepository.save(updatedTask);

      console.log('Task updated and sent to center:', updatedTask);
      return updatedTask;
    } catch (error) {
      console.error('Error in findNextTaskToDoInFront:', error);
      throw new InternalServerErrorException(
        'Error in findNextTaskToDoInFront: ' + error.message,
      );
    }
  }

  /**
   * Generates a random time interval based on the provided number.
   */
  private generateRandomTime(num) {
    if (num === 1) {
      // Generate a random time between 10 and 60 seconds (10,000 to 60,000 milliseconds)
      return Math.floor(Math.random() * (60000 - 10000 + 1) + 10000); // 10s to 60s
    } else if (num === 2) {
      // Generate a random time between 1 and 5 hours (3,600,000 to 18,000,000 milliseconds)
      return Math.floor(Math.random() * (18000000 - 3600000 + 1) + 3600000); // 1h to 5h
    } else if (num === 3) {
      // Generate a random time between 1 and 2 days (86,400,000 to 172,800,000 milliseconds)
      return Math.floor(Math.random() * (172800000 - 86400000 + 1) + 86400000); // 1d to 2d
    } else {
      return null; // Invalid input
    }
  }
}
