import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Front } from './front.entity';
import { User } from './user.entity';

@Entity()
export class Center {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToOne(() => Front, { cascade: true })
  @JoinColumn()
  front: Front;

  @OneToMany(() => User, (user) => user.center, { cascade: true })
  tasks: User[];

  constructor(center: Partial<Center>) {
    Object.assign(this, center);
  }
}
