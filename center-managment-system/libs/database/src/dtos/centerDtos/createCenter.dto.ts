import { generateRandomId } from '@app/common';

export class CreateCenterDto {
  id: number;
  name: string;
  frontId: number;

  constructor(center: Partial<CreateCenterDto>) {
    if (center.name === undefined || center.frontId === undefined) {
      throw new Error(
        'All required properties (name, frontId) must be provided with correct types.',
      );
    }

    Object.assign(this, center);
    this.id = generateRandomId();
  }
}
