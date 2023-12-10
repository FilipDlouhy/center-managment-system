import { Controller } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TASK_MESSAGES } from '@app/rmq/rmq.task.constants';
import { MessagePattern } from '@nestjs/microservices';
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
    return await this.tasksService.createTask(data);
  }

  // Delete a task by its ID
  @MessagePattern(TASK_MESSAGES.deleteTask)
  async deleteTask(id: number): Promise<boolean> {
    return await this.tasksService.deleteTask(id);
  }

  // Get a list of all tasks
  @MessagePattern(TASK_MESSAGES.getAllTasks)
  async getAllTasks(): Promise<Task[]> {
    return await this.tasksService.getAllTasks();
  }

  // Get a task by its ID
  @MessagePattern(TASK_MESSAGES.getTask)
  async getTask(id: number): Promise<Task> {
    return await this.tasksService.getTask(id);
  }

  // Update the state of a task
  @MessagePattern(TASK_MESSAGES.updateTaskState)
  async updateTaskState(
    updateTaskStateStateDto: UpdateTaskStateDTO,
  ): Promise<boolean> {
    return await this.tasksService.updateTaskState(updateTaskStateStateDto);
  }

  // Get the best task for a front-end
  @MessagePattern(TASK_MESSAGES.getBestTaskForFront)
  async getBestTaskForFront(): Promise<Task | null> {
    return await this.tasksService.getBestTaskForFront();
  }

  // Find the next task to do in a specific front-end
  @MessagePattern(TASK_MESSAGES.findNextTaskToDoInFront)
  async findNextTaskToDoInFront(frontIdObj: {
    frontId: number;
  }): Promise<Task | null> {
    return await this.tasksService.findNextTaskToDoInFront(frontIdObj.frontId);
  }

  // Add a front-end to a task
  @MessagePattern(TASK_MESSAGES.addFrontToTask)
  async addFrontToTask(
    taskToaddToTheFront: AddTaskToFrontDTO,
  ): Promise<boolean> {
    return await this.tasksService.addFrontToTask(taskToaddToTheFront);
  }

  // Delete front from tasks
  @MessagePattern(TASK_MESSAGES.deleteFrontFromTasks)
  async deleteFrontFromTasks({
    frontId,
  }: {
    frontId: number;
  }): Promise<boolean> {
    return await this.tasksService.deleteFrontFromTasks(frontId);
  }

  // Delete front from tasks
  @MessagePattern(TASK_MESSAGES.deleteTasksWithoutUser)
  async deleteTasksWithoutUser({
    userId,
  }: {
    userId: number;
  }): Promise<boolean> {
    return await this.tasksService.deleteTasksWithoutUser(userId);
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
    return await this.tasksService.sendTaskToDoAfterRestart(centerId, frontId);
  }
}
