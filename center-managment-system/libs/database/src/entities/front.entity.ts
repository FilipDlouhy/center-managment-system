import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Task } from './task.entity';

@Entity()
export class Front {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  maxTasks: number;

  @Column()
  taskTotal: number;

  @OneToMany(() => Task, (task) => task.front, { cascade: true })
  tasks: Task[];

  @Column()
  timeToCompleteAllTasks: number;

  constructor(front: Partial<Front>) {
    Object.assign(this, front);
  }
}
