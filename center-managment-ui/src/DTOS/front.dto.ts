import { TaskDto } from "./task.dto";

export class FrontDto {
  id!: number;
  maxTasks!: number;
  taskTotal!: number;
  tasks!: TaskDto[];
  timeToCompleteAllTasks!: number;

  constructor(front: Partial<FrontDto>) {
    Object.assign(this, front);
  }
}
