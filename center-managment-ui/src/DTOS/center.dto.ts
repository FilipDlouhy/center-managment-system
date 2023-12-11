import { FrontDto } from "./front.dto";

export class CenterDto {
  id!: number;
  name!: string;
  front!: FrontDto;

  constructor(center: Partial<CenterDto>) {
    Object.assign(this, center);
  }
}
