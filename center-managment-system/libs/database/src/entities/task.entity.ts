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

  @Column('timestamp', { nullable: true })
  whenAddedToTheFront: Date | null;

  @Column()
  processedAt: number;

  @ManyToOne(() => User, (user) => user.tasks)
  user: User;

  @ManyToOne(() => Front, (front) => front.tasks, { nullable: true })
  front: Front | null;

  constructor(task: Partial<Task>) {
    Object.assign(this, task);
  }
}
