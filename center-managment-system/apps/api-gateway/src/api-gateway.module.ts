import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { USER_QUEUE } from '@app/rmq';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TASK_QUEUE } from '@app/rmq/rmq.task.constants';

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
    ]),
  ],
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService],
})
export class ApiGatewayModule {}
