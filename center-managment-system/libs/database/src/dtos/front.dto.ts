import { generateRandomId } from '@app/common';

export class FrontDTO {
  id: number;
  maxTasks: number;

  constructor(front: Partial<FrontDTO>) {
    if (front.maxTasks === undefined) {
      throw new Error(
        'All required properties must be provided with correct types.',
      );
    }

    this.id = generateRandomId();
    Object.assign(this, front);
  }
}
