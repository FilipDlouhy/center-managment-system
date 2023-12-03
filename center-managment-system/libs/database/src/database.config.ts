// common/database.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Front } from './entities/front.entity';
import { User } from './entities/user.entity';
import { Center } from './entities/center.entity';
import { Task } from './entities/task.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'user',
  password: 'password',
  database: 'mydb',
  entities: [Front, User, Center, Task],
  synchronize: true,
  driver: require('mysql2'),
};
