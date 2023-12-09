import { generateRandomId } from '@app/common';

export class CreateTaskDto {
  id: number;
  description: string;
  status: string;
  createdAt: Date;
  processedAt: number;
  userId: number;
  frontId: number;

  constructor(
    task: Partial<CreateTaskDto>,
    frontId: number,
    processedAt: number,
    status: string, // Add the status parameter
  ) {
    this.id = generateRandomId();
    this.description = task.description;
    this.status = status; // Assign the status parameter
    this.userId = task.userId;
    this.frontId = frontId;

    this.processedAt = processedAt;

    const currentTime = new Date().getTime();
    this.createdAt = new Date(currentTime);
  }
}
