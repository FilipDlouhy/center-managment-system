export class UpdateLengthDTO {
  maximumFrontLength: number;

  constructor(updateLength: Partial<UpdateLengthDTO>) {
    Object.assign(this, updateLength);
  }
}
