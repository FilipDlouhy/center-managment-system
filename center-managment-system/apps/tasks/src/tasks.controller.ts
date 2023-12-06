import { Controller } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TASK_MESSAGES } from '@app/rmq/rmq.task.constants';
import { MessagePattern } from '@nestjs/microservices';
import { CreateTaskDto } from '@app/database/dtos/tasksDtos/createTask.dto';

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @MessagePattern(TASK_MESSAGES.createTask)
  async createTask(data: CreateTaskDto) {
    return await this.tasksService.createTask(data);
  }

  @MessagePattern(TASK_MESSAGES.deleteTask)
  async deleteTask() {}

  @MessagePattern(TASK_MESSAGES.getAllTasks)
  async getAllTasks() {}

  @MessagePattern(TASK_MESSAGES.getTask)
  async getTask() {}

  @MessagePattern(TASK_MESSAGES.updateTask)
  async updateTask() {}
}
