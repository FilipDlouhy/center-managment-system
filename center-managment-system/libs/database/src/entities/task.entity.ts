import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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

  constructor(task: Partial<Task>) {
    Object.assign(this, task);
  }
}
