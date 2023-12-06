import { generateRandomId } from '@app/common';

export class FrontDTO {
  id: number;
  maxTasks: number;
  taskTotal: number;
  timeToCompleteAllTasks: number;

  constructor(front: Partial<FrontDTO>) {
    if (front.maxTasks === undefined) {
      throw new Error(
        'All required properties must be provided with correct types.',
      );
    }

    this.id = generateRandomId();
    this.timeToCompleteAllTasks = 0;
    this.taskTotal = 0;
    Object.assign(this, front);
  }
}
