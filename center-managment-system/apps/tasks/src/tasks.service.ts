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
import { Repository } from 'typeorm';
import * as amqp from 'amqplib';
import { taskStatus } from '@app/database/dtos/tasksDtos/taskStatus';

@Injectable()
export class TasksService implements OnModuleInit {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
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
  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    // Retrieve the Front object using the client proxy
    const timeToCompleteTask = 5000;

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
        front: front,
        user,
      });
      const savedTask = await this.taskRepository.save(newTask);

      return savedTask;
    } else {
      const updateFrontTaskLengthAndTimeDto: FrontUpdateTimeAndTasksDTO =
        new FrontUpdateTimeAndTasksDTO(front.id, timeToCompleteTask);

      const wasFrontUpdated: boolean = await this.frontClient
        .send(
          FRONT_MESSAGES.updateFrontTasksLength,
          updateFrontTaskLengthAndTimeDto,
        )
        .toPromise();

      console.log(wasFrontUpdated);
      if (wasFrontUpdated) {
        const user: User = await this.userClient
          .send(USER_MESSAGES.getUserForTask, { userId: createTaskDto.userId })
          .toPromise();

        const { center_id } = await this.centerClient
          .send(CENTER_MESSAGES.getCeterWithFrontId, { frontId: front.id })
          .toPromise();
        console.log(center_id);
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
        });
        this.sendMessageToCenter(center_id, newTaskDto);
        const savedTask = await this.taskRepository.save(newTask);

        return savedTask;
      }
    }
  }

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

      if (!task) {
        throw new NotFoundException('User not found');
      }

      return task;
    } catch (error) {
      console.error('Error while finding user:', error);

      throw new InternalServerErrorException('Error while finding user');
    }
  }
}
