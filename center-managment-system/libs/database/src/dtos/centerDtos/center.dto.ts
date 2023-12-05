import { generateRandomId } from '@app/common';

export class CenterDTO {
  id: number;
  name: string;
  frontId: number;

  constructor(center: Partial<CenterDTO>) {
    if (center.name === undefined) {
      throw new Error(
        'All required properties (name) must be provided with correct types.',
      );
    }

    this.id = generateRandomId();

    Object.assign(this, center);
  }
}
