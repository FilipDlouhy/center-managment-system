import { generateRandomId } from '@app/common';

export class TaskDTO {
  id: number;
  description: string;
  status: string;
  createdAt: Date;
  processedAt: Date;
  userId: number;
  frontId: number;

  constructor(task: Partial<TaskDTO>) {
    if (task.description === undefined || task.status === undefined) {
      throw new Error(
        'All required properties (description, status) must be provided with correct types.',
      );
    }

    this.id = generateRandomId();

    Object.assign(this, task);
  }
}
