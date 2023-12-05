import { CentersModule } from './centers.module';
import { NestFactory } from '@nestjs/core';
import { CENTER_QUEUE } from '@app/rmq/rmq.center.constants';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CentersModule,
    {
      transport: Transport.RMQ,
      options: {
        queue: CENTER_QUEUE.queueName,
        urls: [CENTER_QUEUE.url],
        queueOptions: {
          durable: false,
        },
      },
    },
  );
  await app.listen();
}
bootstrap();
