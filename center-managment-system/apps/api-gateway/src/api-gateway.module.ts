import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { USER_QUEUE } from '@app/rmq';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TASK_QUEUE } from '@app/rmq/rmq.task.constants';
import { FRONT_QUEUE } from '@app/rmq/rmq.front.constants';
import { CENTER_QUEUE } from '@app/rmq/rmq.center.constants';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    ClientsModule.register([
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
    ]),
    CacheModule.register({ ttl: 3600 * 3 }),
  ],
  controllers: [ApiGatewayController],
  providers: [
    ApiGatewayService,
    { provide: APP_INTERCEPTOR, useClass: CacheInterceptor },
  ],
})
export class ApiGatewayModule {}
