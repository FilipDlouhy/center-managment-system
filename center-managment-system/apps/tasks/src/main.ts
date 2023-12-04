import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { TasksModule } from './tasks.module';
import { TASK_QUEUE } from '@app/rmq/rmq.task.constants';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    TasksModule,
    {
      transport: Transport.RMQ,
      options: {
        queue: TASK_QUEUE.queueName,
        urls: [TASK_QUEUE.url],
        queueOptions: {
          durable: false,
        },
      },
    },
  );
  await app.listen();
}
bootstrap();
