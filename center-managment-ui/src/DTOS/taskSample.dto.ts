export class TaskSampleDto {
  id: number;
  description: string;

  constructor(data: { id: number; description: string }) {
    this.id = data.id;
    this.description = data.description;
  }
}
