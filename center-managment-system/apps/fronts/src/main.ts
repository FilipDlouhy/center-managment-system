import { NestFactory } from '@nestjs/core';
import { FrontsModule } from './fronts.module';
import { FRONT_QUEUE } from '@app/rmq/rmq.front.constants';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    FrontsModule,
    {
      transport: Transport.RMQ,
      options: {
        queue: FRONT_QUEUE.queueName,
        urls: [FRONT_QUEUE.url],
        queueOptions: {
          durable: false,
        },
      },
    },
  );
  await app.listen();
}
bootstrap();
