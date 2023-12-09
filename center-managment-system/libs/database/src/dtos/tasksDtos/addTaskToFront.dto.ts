export class AddTaskToFrontDTO {
  id: number;
  status: string;
  processedAt: number;
  frontId: number;

  constructor(
    id: number,
    status: string,
    processedAt: number,
    frontId: number,
  ) {
    this.id = id;
    this.status = status;
    this.processedAt = processedAt;
    this.frontId = frontId;
  }
}
