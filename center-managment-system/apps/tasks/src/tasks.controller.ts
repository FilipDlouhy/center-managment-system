import { Controller } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TASK_MESSAGES } from '@app/rmq/rmq.task.constants';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import { CreateTaskDto } from '@app/database/dtos/tasksDtos/createTask.dto';
import { UpdateTaskStateDTO } from '@app/database/dtos/tasksDtos/updateTaskState.dto';
import { AddTaskToFrontDTO } from '@app/database/dtos/tasksDtos/addTaskToFront.dto';
import { Task } from '@app/database/entities/task.entity';

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // Create a new task
  @MessagePattern(TASK_MESSAGES.createTask)
  async createTask(data: CreateTaskDto): Promise<Task> {
    try {
      return await this.tasksService.createTask(data);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  // Delete a task by its ID
  @MessagePattern(TASK_MESSAGES.deleteTask)
  async deleteTask(id: number): Promise<boolean> {
    try {
      return await this.tasksService.deleteTask(id);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  // Get a list of all tasks
  @MessagePattern(TASK_MESSAGES.getAllTasks)
  async getAllTasks(): Promise<Task[]> {
    try {
      return await this.tasksService.getAllTasks();
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  // Get a task by its ID
  @MessagePattern(TASK_MESSAGES.getTaskUser)
  async getTaskUser(id: number): Promise<Task> {
    try {
      return await this.tasksService.getTask(id, true);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  // Get a task by its ID
  @MessagePattern(TASK_MESSAGES.getTaskAdmin)
  async getTaskAdmin(id: number): Promise<Task> {
    try {
      return await this.tasksService.getTask(id, false);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  // Update the state of a task
  @MessagePattern(TASK_MESSAGES.updateTaskState)
  async updateTaskState(
    updateTaskStateStateDto: UpdateTaskStateDTO,
  ): Promise<boolean> {
    try {
      return await this.tasksService.updateTaskState(updateTaskStateStateDto);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  // Get the best task for a front-end
  @MessagePattern(TASK_MESSAGES.getBestTaskForFront)
  async getBestTaskForFront(): Promise<Task | null> {
    try {
      return await this.tasksService.getBestTaskForFront();
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  // Find the next task to do in a specific front-end
  @MessagePattern(TASK_MESSAGES.findNextTaskToDoInFront)
  async findNextTaskToDoInFront(frontIdObj: {
    frontId: number;
  }): Promise<Task | null> {
    try {
      return await this.tasksService.findNextTaskToDoInFront(
        frontIdObj.frontId,
      );
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  // Add a front-end to a task
  @MessagePattern(TASK_MESSAGES.addFrontToTask)
  async addFrontToTask(
    taskToaddToTheFront: AddTaskToFrontDTO,
  ): Promise<boolean> {
    try {
      return await this.tasksService.addFrontToTask(taskToaddToTheFront);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  // Delete front from tasks
  @MessagePattern(TASK_MESSAGES.deleteFrontFromTasks)
  async deleteFrontFromTasks({
    frontId,
  }: {
    frontId: number;
  }): Promise<boolean> {
    try {
      return await this.tasksService.deleteFrontFromTasks(frontId);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  // Delete front from tasks
  @MessagePattern(TASK_MESSAGES.deleteTasksWithoutUser)
  async deleteTasksWithoutUser({
    userId,
  }: {
    userId: number;
  }): Promise<boolean> {
    try {
      return await this.tasksService.deleteTasksWithoutUser(userId);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  // Delete front from tasks
  @MessagePattern(TASK_MESSAGES.sendTaskToDoAfterRestart)
  async sendTaskToDoAfterRestart({
    centerId,
    frontId,
  }: {
    centerId: number;
    frontId: number;
  }): Promise<void> {
    try {
      return await this.tasksService.sendTaskToDoAfterRestart(
        centerId,
        frontId,
      );
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  // get users tasks
  @MessagePattern(TASK_MESSAGES.getUsersTasks)
  async getUsersTasks({ userId }: { userId: number }): Promise<Task[]> {
    try {
      return await this.tasksService.getUsersTasks(userId);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  // get users tasks wchich are being done
  @MessagePattern(TASK_MESSAGES.getUsersTasksCurrent)
  async getUsersTasksCurrent({ userId }: { userId: number }): Promise<Task[]> {
    try {
      return await this.tasksService.getUsersTasksCurrent(userId);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }
}
