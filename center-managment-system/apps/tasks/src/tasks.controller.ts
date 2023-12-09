import { Controller } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TASK_MESSAGES } from '@app/rmq/rmq.task.constants';
import { MessagePattern } from '@nestjs/microservices';
import { CreateTaskDto } from '@app/database/dtos/tasksDtos/createTask.dto';
import { UpdateTaskStateDTO } from '@app/database/dtos/tasksDtos/updateTaskState.dto';
import { AddTaskToFrontDTO } from '@app/database/dtos/tasksDtos/addTaskToFront.dto';

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // Create a new task
  @MessagePattern(TASK_MESSAGES.createTask)
  async createTask(data: CreateTaskDto) {
    return await this.tasksService.createTask(data);
  }

  // Delete a task by its ID
  @MessagePattern(TASK_MESSAGES.deleteTask)
  async deleteTask(id: number) {
    return await this.tasksService.deleteTask(id);
  }

  // Get a list of all tasks
  @MessagePattern(TASK_MESSAGES.getAllTasks)
  async getAllTasks() {
    return await this.tasksService.getAllTasks();
  }

  // Get a task by its ID
  @MessagePattern(TASK_MESSAGES.getTask)
  async getTask(id: number) {
    return await this.tasksService.getTask(id);
  }

  // Update the state of a task
  @MessagePattern(TASK_MESSAGES.updateTaskState)
  async updateTaskState(updateTaskStateStateDto: UpdateTaskStateDTO) {
    return await this.tasksService.updateTaskState(updateTaskStateStateDto);
  }

  // Get the best task for a front-end
  @MessagePattern(TASK_MESSAGES.getBestTaskForFront)
  async getBestTaskForFront() {
    return await this.tasksService.getBestTaskForFront();
  }

  // Find the next task to do in a specific front-end
  @MessagePattern(TASK_MESSAGES.findNextTaskToDoInFront)
  async findNextTaskToDoInFront(frontIdObj: { frontId: number }) {
    return await this.tasksService.findNextTaskToDoInFront(frontIdObj.frontId);
  }

  // Add a front-end to a task
  @MessagePattern(TASK_MESSAGES.addFrontToTask)
  async addFrontToTask(taskToaddToTheFront: AddTaskToFrontDTO) {
    return await this.tasksService.addFrontToTask(taskToaddToTheFront);
  }
}
