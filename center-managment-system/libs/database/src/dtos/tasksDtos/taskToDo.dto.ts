export class TaskToDoDTO {
  id: number;
  description: string;
  status: string;
  createdAt: Date;
  processedAt: number;
  userId: number;
  frontId: number;

  constructor(
    id: number,
    description: string,
    status: string,
    createdAt: Date,
    processedAt: number,
    userId: number,
    frontId: number,
  ) {
    this.id = id;
    this.description = description;
    this.status = status;
    this.createdAt = createdAt;
    this.processedAt = processedAt;
    this.userId = userId;
    this.frontId = frontId;
  }
}
