export class CreateTaskDto {
  description: string;
  userId: number | undefined;

  constructor(description: string, userId: number | undefined) {
    this.description = description;
    this.userId = userId;
  }
}
