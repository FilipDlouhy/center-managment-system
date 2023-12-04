import { generateRandomId } from '@app/common';

export class CenterDTO {
  id: number;
  name: string;

  constructor(center: Partial<CenterDTO>) {
    if (center.name === undefined) {
      throw new Error(
        'All required properties must be provided with correct types.',
      );
    }

    this.id = generateRandomId();
    Object.assign(this, center);
  }
}
