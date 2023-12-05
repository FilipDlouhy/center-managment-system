import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Task } from './task.entity';
import { Center } from './center.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  password: string;

  @Column({ unique: true })
  email: string;

  @Column()
  admin: boolean;

  @OneToMany(() => Task, (task) => task.user, { cascade: true })
  tasks: Task[];

  constructor(user: Partial<User>) {
    Object.assign(this, user);
  }
}
