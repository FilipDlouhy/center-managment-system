import { UserDto } from "./user.dto";
import { FrontDto } from "./front.dto";

export class TaskAdminDto {
  id!: number;
  description!: string;
  status!: string;
  createdAt!: Date;
  whenAddedToTheFront!: Date | null;
  processedAt!: number;
  user!: UserDto;
  front!: FrontDto | null;

  constructor(task: Partial<TaskAdminDto>) {
    Object.assign(this, task);
  }
}
