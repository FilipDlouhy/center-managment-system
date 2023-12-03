import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Front } from './front.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column()
  status: string;

  @Column('timestamp')
  createdAt: Date;

  @Column('timestamp')
  processedAt: Date;

  @ManyToOne(() => User, (user) => user.tasks)
  user: User;

  @ManyToOne(() => Front, (front) => front.tasks)
  front: Front;

  constructor(task: Partial<Task>) {
    Object.assign(this, task);
  }
}
