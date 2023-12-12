import { Task } from './libs/database/src/entities/task.entity';
import { User } from './libs/database/src/entities/user.entity';
import { Front } from './libs/database/src/entities/front.entity';
import { Center } from './libs/database/src/entities/center.entity';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config(); // Load environment variables from the .env file

const configService = new ConfigService();

export default new DataSource({
  type: 'mysql',
  host: configService.getOrThrow('MYSQL_HOST'),
  port: parseInt(configService.getOrThrow('MYSQL_PORT'), 10),
  database: configService.getOrThrow('MYSQL_DATABASE'),
  username: configService.getOrThrow('MYSQL_USER'),
  password: configService.getOrThrow('MYSQL_PASSWORD'),
  migrations: ['migrations/**'],
  entities: [Task, User, Front, Center],
});
