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
import { maximumUsersTasks } from '@app/database/length.constant';
import { FillCenterDto } from '@app/database/dtos/centerDtos/fillCenter.dto';

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
    const connection = await amqp.connect('amqp://guest:guest@rabbitmq:5672');
    this.channel = await connection.createChannel();
  }

  private channel: amqp.Channel;
  private exchange = 'center_exchange';

  /**
   * Creates a new task.
   * @param createTaskDto Data Transfer Object for task creation.
   * @returns The created task entity.
   * @throws NotFoundException If the required front or user is not found.
   * @throws InternalServerErrorException For any other unexpected errors.
   */
  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    try {
      const timeToCompleteTask = this.generateRandomTime(1);

      let user: User;
      try {
        user = await this.userClient
          .send(USER_MESSAGES.getUserForTask, { userId: createTaskDto.userId })
          .toPromise();
      } catch (error) {
        throw new Error('Error retrieving user');
      }

      if (user.tasks.length >= maximumUsersTasks) {
        throw new Error('User has too many tasks');
      }

      let front: Front;
      try {
        front = await this.frontClient
          .send(FRONT_MESSAGES.getFrontForTask, {})
          .toPromise();
      } catch (error) {
        throw new Error('Error retrieving front');
      }

      if (!front) {
        return this.createUnscheduledTask(
          createTaskDto,
          user,
          timeToCompleteTask,
        );
      } else {
        if (front.taskTotal === 0) {
          return this.sendFirstTaskToDo(
            createTaskDto,
            user,
            front,
            timeToCompleteTask,
          );
        } else {
          return this.createScheduledTask(
            createTaskDto,
            user,
            front,
            timeToCompleteTask,
          );
        }
      }
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }
  /**
   * Deletes a task by its ID.
   * @param id The ID of the task to be deleted.
   * @returns Boolean indicating success of the operation.
   * @throws NotFoundException If the task is not found.
   * @throws InternalServerErrorException For any other unexpected errors.
   */
  async deleteTask(id: number): Promise<boolean> {
    try {
      const result = await this.taskRepository.delete(id);

      if (result.affected && result.affected > 0) {
        return true;
      } else {
        throw new NotFoundException('Task not found');
      }
    } catch (error) {
      console.error('Error while deleting task:', error);

      throw new InternalServerErrorException(
        'Error while deleting task: ' + error.message,
      );
    }
  }

  /**
   * Retrieves all tasks.
   * @returns An array of task entities.
   * @throws InternalServerErrorException If no tasks are found or in case of an error.
   */
  async getAllTasks(): Promise<Task[]> {
    try {
      const tasks = await this.taskRepository.find({
        select: ['id', 'processedAt', 'createdAt', 'status', 'description'],
        relations: { user: true, front: true },
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
   * @param includeUser Indicates whether to include the user information in the response.
   * @returns The requested task entity.
   * @throws BadRequestException If the provided ID is invalid.
   * @throws NotFoundException If the task is not found.
   * @throws InternalServerErrorException For any other unexpected errors.
   */
  async getTask(id: number, includeUser: boolean): Promise<Task> {
    if (isNaN(id) || id <= 0) {
      throw new BadRequestException('Invalid task ID');
    }
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: includeUser
        ? { front: true, user: true }
        : { front: true, user: false },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.front) {
      task.processedAt = await this.calculateProcessedTime(task);
    }

    return task;
  }

  /**
   * Updates the state of a task.
   * @param updateTaskStateDto Data Transfer Object for updating task state.
   * @returns Boolean indicating success of the operation.
   * @throws NotFoundException If the task is not found.
   * @throws InternalServerErrorException For any other unexpected errors.
   */
  async updateTaskState(
    updateTaskStateDto: UpdateTaskStateDTO,
  ): Promise<boolean> {
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
  async getBestTaskForFront(): Promise<Task | null> {
    try {
      const bestTaskForFront = await this.taskRepository.findOne({
        where: {
          status: taskStatus.UNSCHEDULED,
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
  async addFrontToTask(taskToAdd: AddTaskToFrontDTO): Promise<boolean> {
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
  async findNextTaskToDoInFront(frontId: number): Promise<Task | null> {
    if (!frontId) {
      throw new BadRequestException('Invalid front ID');
    }

    try {
      const updatedTask = await this.taskRepository.findOne({
        where: {
          front: { id: frontId },
          status: taskStatus.SCHEDULED,
        },
        relations: ['user', 'front'],
        order: {
          whenAddedToTheFront: 'ASC',
        },
      });

      if (!updatedTask) {
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

      await this.sendMessageToCenter(center_id, newTaskToDo);
      await this.taskRepository.save(updatedTask);

      return updatedTask;
    } catch (error) {
      console.error('Error in findNextTaskToDoInFront:', error);
      throw new InternalServerErrorException(
        'Error in findNextTaskToDoInFront: ' + error.message,
      );
    }
  }

  /**
   * Deletes the association between a front and tasks by setting the 'front' property to null.
   *
   * @param frontId - The ID of the front to disassociate from tasks.
   * @returns true if the operation was successful, or false if it failed.
   */
  async deleteFrontFromTasks(frontId: number): Promise<boolean> {
    try {
      const result = await this.taskRepository.update(
        { front: { id: frontId } },
        {
          front: null,
          whenAddedToTheFront: null,
          status: taskStatus.UNSCHEDULED,
        },
      );

      if (result.affected >= 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      throw new Error(`Failed WWW delete front from tasks: ${error.message}`);
    }
  }

  /**
   * Deletes tasks that are not associated with a specific user.
   *
   * @param userId - The ID of the user whose tasks should be deleted.
   * @returns true if there were tasks associated with the user and they were deleted, or false if no tasks were deleted.
   * @throws Error if there's an error during the deletion process.
   */
  async deleteTasksWithoutUser(userId: number): Promise<boolean> {
    try {
      // Check if there are tasks with status "doing" for the user
      const tasksDoing = await this.taskRepository.find({
        where: { user: { id: userId }, status: taskStatus.DOING },
      });

      if (tasksDoing.length > 0) {
        return false; // There are tasks with status "doing," return false
      }

      // If no tasks with status "doing" are found, proceed to delete tasks without a user
      const result = await this.taskRepository.delete({
        user: { id: userId },
      });

      if (result.affected > 0) {
        return true; // Tasks were deleted
      } else {
        return false; // No tasks were deleted
      }
    } catch (error) {
      throw new Error(`Failed to delete tasks: ${error.message}`);
    }
  }

  /**
   * Sends a task to do after a system restart to the specified center.
   *
   * @param centerId - The ID of the center to send the task to.
   * @param frontId - The ID of the front associated with the task.
   */
  async sendTaskToDoAfterRestart(
    centerId: number,
    frontId: number,
  ): Promise<void> {
    try {
      const taskTodo = await this.taskRepository.findOne({
        where: {
          front: { id: frontId },
          status: taskStatus.DOING,
        },
        relations: { user: true },
      });

      if (!taskTodo) {
        return;
      }

      const whenAddedToTheFront = new Date(
        taskTodo.whenAddedToTheFront,
      ).getTime();
      const currentTime = new Date().getTime();
      const millisecondsDifference = currentTime - whenAddedToTheFront;

      const newTaskToDo = new TaskToDoDTO(
        taskTodo.id,
        taskTodo.description,
        taskTodo.status,
        taskTodo.createdAt,
        taskTodo.processedAt,
        taskTodo.user.id,
        frontId,
      );

      taskTodo.processedAt = taskTodo.processedAt + millisecondsDifference;

      const updateFrontTimeDto = new FrontUpdateTimeAndTasksDTO(
        frontId,
        millisecondsDifference,
      );

      const wasFrontUpdated = await this.frontClient
        .send(FRONT_MESSAGES.updateTimeToCompleteAllTasks, updateFrontTimeDto)
        .toPromise();

      if (!wasFrontUpdated) {
        throw new Error('Failed to update the front with the new time.');
      }

      await this.taskRepository.save(taskTodo);

      await this.sendMessageToCenter(centerId.toString(), newTaskToDo);
    } catch (error) {
      console.error('An error occurred while processing the task:', error);
    }
  }

  /**
   * Get tasks for a specific user by userId.
   * @param userId - The ID of the user for whom tasks should be retrieved.
   * @returns A Promise that resolves to an array of Task objects.
   * @throws NotFoundException if the user with the specified userId is not found.
   */
  async getUsersTasks(userId: number): Promise<Task[]> {
    try {
      // Find tasks for the user with the specified userId
      const usersTasks = await this.taskRepository.find({
        where: {
          user: { id: userId },
        },
        select: ['id', 'description'],
      });

      if (!usersTasks) {
        // Throw NotFoundException if the user's tasks are not found
        throw new NotFoundException(
          `Tasks for user with ID ${userId} not found.`,
        );
      }

      return usersTasks;
    } catch (error) {
      // Handle exceptions here
      throw new InternalServerErrorException(
        'An error occurred while fetching user tasks.',
      );
    }
  }

  /**
   * Get tasks for a specific user by userId and if they are being processed right now.
   * @param userId - The ID of the user for whom tasks should be retrieved.
   * @returns A Promise that resolves to an array of Task objects.
   * @throws NotFoundException if the user with the specified userId is not found.
   */
  async getUsersTasksCurrent(userId: number) {
    try {
      const usersTasks = await this.taskRepository.find({
        where: {
          user: { id: userId },
          status: taskStatus.DOING,
        },
        select: ['id', 'description'],
      });

      if (!usersTasks) {
        throw new NotFoundException(
          `Tasks for user with ID ${userId} not found.`,
        );
      }

      return usersTasks;
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while fetching user tasks.',
      );
    }
  }

  /**
   * Fills the center with tasks from the repository.
   * Retrieves unscheduled tasks and adds them to a center, handling new centers differently.
   * @param {FillCenterDto} fillCenterDto - DTO containing information to fill the center.
   */
  async fillTheCenter(fillCenterDto: FillCenterDto): Promise<void> {
    try {
      const fillerTasks = await this.taskRepository.find({
        where: { status: taskStatus.UNSCHEDULED, whenAddedToTheFront: null },
        take: fillCenterDto.numberOfTasksToFill,
        relations: { user: true },
      });

      for (const [index, task] of fillerTasks.entries()) {
        const status =
          fillCenterDto.isCenterNew && index === 0
            ? taskStatus.DOING
            : taskStatus.SCHEDULED;
        const taskToFrontDto = new AddTaskToFrontDTO(
          task.id,
          status,
          task.processedAt,
          fillCenterDto.frontId,
        );

        await this.frontClient
          .send(FRONT_MESSAGES.addBestTaskToFront, taskToFrontDto)
          .toPromise();
        await this.addFrontToTask(taskToFrontDto);

        if (fillCenterDto.isCenterNew && index === 0) {
          const newTaskToDo = new TaskToDoDTO(
            task.id,
            task.description,
            task.status,
            task.createdAt,
            task.processedAt,
            task.user.id,
            fillCenterDto.frontId,
          );

          this.sendMessageToCenter(
            fillCenterDto.centerId.toString(),
            newTaskToDo,
          );
        }
      }
    } catch (error) {
      console.error('Error in fillTheCenter:', error);
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

  /**
   * Sends a JSON message to a specific message queue associated with a center.
   *
   * @param centerId - The ID of the center to send the message to.
   * @param messageObject - The JSON message object to send.
   */
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
   * Calculate the total processed time for a task, including its previous tasks in the same front.
   * @param task The task for which to calculate the processed time.
   * @returns The total processed time for the task.
   */
  private async calculateProcessedTime(task: Task): Promise<number> {
    const tasksBefore = await this.taskRepository.find({
      where: {
        front: { id: task.front.id },
      },
      select: ['processedAt', 'whenAddedToTheFront'],
    });

    let timeToAdd = task.processedAt;

    tasksBefore.forEach((taskBefore) => {
      if (taskBefore.whenAddedToTheFront < task.whenAddedToTheFront) {
        timeToAdd += taskBefore.processedAt;
      }
    });

    return timeToAdd;
  }

  /**
   * Create a new unscheduled task.
   * @param createTaskDto Data Transfer Object for task creation.
   * @param user The user associated with the task.
   * @param timeToCompleteTask The time required to complete the task.
   * @returns The created unscheduled task entity.
   */
  private async createUnscheduledTask(
    createTaskDto: CreateTaskDto,
    user: User,
    timeToCompleteTask: number,
  ): Promise<Task> {
    const newTaskDto = new CreateTaskDto(
      createTaskDto,
      null,
      timeToCompleteTask,
      taskStatus.UNSCHEDULED,
    );
    const newTask = this.taskRepository.create({ ...newTaskDto, user });
    return await this.taskRepository.save(newTask);
  }

  /**
   * Create a new scheduled task and update the associated front's task length and time.
   * @param createTaskDto Data Transfer Object for task creation.
   * @param user The user associated with the task.
   * @param front The front associated with the task.
   * @param timeToCompleteTask The time required to complete the task.
   * @returns The created scheduled task entity.
   * @throws Error If there is an error updating the front or the front update fails.
   */
  private async createScheduledTask(
    createTaskDto: CreateTaskDto,
    user: User,
    front: Front,
    timeToCompleteTask: number,
  ): Promise<Task> {
    let wasFrontUpdated: boolean;
    try {
      const updateFrontTaskLengthAndTimeDto = new FrontUpdateTimeAndTasksDTO(
        front.id,
        timeToCompleteTask,
      );
      wasFrontUpdated = await this.frontClient
        .send(
          FRONT_MESSAGES.addFrontTasksLength,
          updateFrontTaskLengthAndTimeDto,
        )
        .toPromise();
    } catch (error) {
      throw new Error('Error updating front');
    }

    if (!wasFrontUpdated) {
      throw new Error('Failed to update the front');
    }

    const newTaskDto = new CreateTaskDto(
      createTaskDto,
      front.id,
      timeToCompleteTask,
      taskStatus.SCHEDULED,
    );

    const newTask = this.taskRepository.create({
      ...newTaskDto,
      user,
      front,
      whenAddedToTheFront: new Date(),
    });

    return await this.taskRepository.save(newTask);
  }

  /**
   * This function is responsible for sending the first task to do in your Nest.js API.
   * It takes in a set of parameters and performs several operations, including updating the front,
   * creating a new task, and sending a message to the center.
   *
   * @param createTaskDto - The DTO (Data Transfer Object) containing information about the task to be created.
   * @param user - The user associated with the task.
   * @param front - The front associated with the task.
   * @param timeToCompleteTask - The time required to complete the task.
   * @returns A promise that resolves with the newly created task.
   */
  async sendFirstTaskToDo(
    createTaskDto: CreateTaskDto,
    user: User,
    front: Front,
    timeToCompleteTask: number,
  ) {
    let wasFrontUpdated: boolean;
    try {
      const updateFrontTaskLengthAndTimeDto = new FrontUpdateTimeAndTasksDTO(
        front.id,
        timeToCompleteTask,
      );
      wasFrontUpdated = await this.frontClient
        .send(
          FRONT_MESSAGES.addFrontTasksLength,
          updateFrontTaskLengthAndTimeDto,
        )
        .toPromise();
    } catch (error) {
      throw new Error('Error updating front');
    }

    if (!wasFrontUpdated) {
      throw new Error('Failed to update the front');
    }

    const newTaskDto = new CreateTaskDto(
      createTaskDto,
      front.id,
      timeToCompleteTask,
      taskStatus.DOING,
    );
    const newTask = this.taskRepository.create({
      ...newTaskDto,
      user,
      front,
      whenAddedToTheFront: new Date(),
    });
    const newTaskToDo = new TaskToDoDTO(
      newTask.id,
      newTask.description,
      newTask.status,
      newTask.createdAt,
      newTask.processedAt,
      newTask.user.id,
      front.id,
    );
    newTaskToDo.userId = newTask.user.id;
    const { center_id } = await this.centerClient
      .send(CENTER_MESSAGES.getCeterWithFrontId, { frontId: front.id })
      .toPromise();
    await this.sendMessageToCenter(center_id, newTaskToDo);
    return await this.taskRepository.save(newTask);
  }
}
