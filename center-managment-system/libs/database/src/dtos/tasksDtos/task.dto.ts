import { generateRandomId } from "@app/common";

export class TaskDTO {
  id: number;
  description: string;
  status: string;
  createdAt: Date;
  processedAt: Date;

  constructor(task: Partial<TaskDTO>) {
    if (
       task.description=== undefined ||
       task.status === undefined ||
    ) {
      throw new Error(
        'All required properties must be provided with correct types.',
      );
    }

    this.id = generateRandomId();

    Object.assign(this, task);
  }
}
