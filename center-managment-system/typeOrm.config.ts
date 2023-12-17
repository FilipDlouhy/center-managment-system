import { Task } from './libs/database/src/entities/task.entity';
import { User } from './libs/database/src/entities/user.entity';
import { Front } from './libs/database/src/entities/front.entity';
import { Center } from './libs/database/src/entities/center.entity';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config(); // Load environment variables from the .env file

export default new DataSource({
  type: 'mysql',
  host: 'mysql',
  port: 3306,
  username: 'root',
  password: 'rootpassword',
  database: 'mydb',
  migrations: ['migrations/**'],
  entities: [Task, User, Front, Center],
});
