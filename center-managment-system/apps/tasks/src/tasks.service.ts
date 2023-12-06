import { CreateTaskDto } from '@app/database/dtos/tasksDtos/createTask.dto';
import { Front } from '@app/database/entities/front.entity';
import { Task } from '@app/database/entities/task.entity';
import { User } from '@app/database/entities/user.entity';
import { USER_MESSAGES, USER_QUEUE } from '@app/rmq';
import { FRONT_MESSAGES, FRONT_QUEUE } from '@app/rmq/rmq.front.constants';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly entityManager: EntityManager,
    @Inject(FRONT_QUEUE.serviceName)
    private readonly frontClient: ClientProxy,
    @Inject(USER_QUEUE.serviceName)
    private readonly userClient: ClientProxy,
  ) {}
  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    // Retrieve the Front object using the client proxy
    const front: Front = await this.frontClient
      .send(FRONT_MESSAGES.getFrontForTask, {})
      .toPromise();

    if (!front) {
      throw new Error('Front not found');
    }

    console.log(createTaskDto);
    const user: User = await this.userClient
      .send(USER_MESSAGES.getUserForTask, { userId: createTaskDto.userId })
      .toPromise();

    console.log(user);
    // Save the new Task entity
    const newTaskDto = new CreateTaskDto(createTaskDto, front.id, 5000);
    const newTask = this.taskRepository.create({
      ...newTaskDto,
      front: front,
      user,
    });
    const savedTask = await this.taskRepository.save(newTask);
    console.log(savedTask);

    return savedTask;
  }
}
