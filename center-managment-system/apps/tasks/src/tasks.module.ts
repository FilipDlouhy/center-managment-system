import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { FRONT_QUEUE } from '@app/rmq/rmq.front.constants';
import { TASK_QUEUE } from '@app/rmq/rmq.task.constants';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DatabaseModule } from '@app/database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '@app/database/entities/task.entity';
import { USER_QUEUE } from '@app/rmq';
import { CENTER_QUEUE } from '@app/rmq/rmq.center.constants';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([Task]),
    ClientsModule.register([
      {
        name: TASK_QUEUE.serviceName,
        transport: Transport.RMQ,
        options: {
          urls: [TASK_QUEUE.url],
          queue: TASK_QUEUE.queueName,
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: FRONT_QUEUE.serviceName,
        transport: Transport.RMQ,
        options: {
          urls: [FRONT_QUEUE.url],
          queue: FRONT_QUEUE.queueName,
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: USER_QUEUE.serviceName,
        transport: Transport.RMQ,
        options: {
          urls: [USER_QUEUE.url],
          queue: USER_QUEUE.queueName,
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: CENTER_QUEUE.serviceName,
        transport: Transport.RMQ,
        options: {
          urls: [CENTER_QUEUE.url],
          queue: CENTER_QUEUE.queueName,
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
