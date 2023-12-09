export class UpdateTaskStateDTO {
  id: number;
  status: string;
  frontId: number;

  constructor(id: number, status: string, frontId: number) {
    this.id = id;
    this.status = status;
    this.frontId = frontId;
  }
}
