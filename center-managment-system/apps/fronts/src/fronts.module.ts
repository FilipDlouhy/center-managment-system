import { Module } from '@nestjs/common';
import { FrontsController } from './fronts.controller';
import { FrontsService } from './fronts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '@app/database';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Front } from '@app/database/entities/front.entity';
import { FRONT_QUEUE } from '@app/rmq/rmq.front.constants';
import { CENTER_QUEUE } from '@app/rmq/rmq.center.constants';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([Front]),
    ClientsModule.register([
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
  controllers: [FrontsController],
  providers: [FrontsService],
})
export class FrontsModule {}
