import { Controller } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TASK_MESSAGES } from '@app/rmq/rmq.task.constants';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @MessagePattern(TASK_MESSAGES.createTask)
  async createTask() {}

  @MessagePattern(TASK_MESSAGES.deleteTask)
  async deleteTask() {}

  @MessagePattern(TASK_MESSAGES.getAllTasks)
  async getAllTasks() {}

  @MessagePattern(TASK_MESSAGES.getTask)
  async getTask() {}

  @MessagePattern(TASK_MESSAGES.updateTask)
  async updateTask() {}
}
