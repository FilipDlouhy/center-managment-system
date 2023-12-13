import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Task } from './task.entity';

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
