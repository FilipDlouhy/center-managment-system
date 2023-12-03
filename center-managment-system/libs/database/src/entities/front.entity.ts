import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Front {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  maxTasks: number;
}
