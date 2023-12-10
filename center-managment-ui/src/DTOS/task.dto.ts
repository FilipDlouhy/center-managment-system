export class TaskDto {
  id: number;
  description: string;
  status: string;
  createdAt: Date;
  whenAddedToTheFront: Date;
  processedAt: number;

  constructor(data: {
    id: number;
    description: string;
    status: string;
    createdAt: string;
    whenAddedToTheFront: string;
    processedAt: number;
  }) {
    this.id = data.id;
    this.description = data.description;
    this.status = data.status;
    this.createdAt = new Date(data.createdAt);
    this.whenAddedToTheFront = new Date(data.whenAddedToTheFront);
    this.processedAt = data.processedAt;
  }
}
