export class UpdateCenterDto {
  id: number;
  name: string;

  constructor(center: Partial<UpdateCenterDto>) {
    if (center.name === undefined) {
      throw new Error(
        'All required properties (name, frontId) must be provided with correct types.',
      );
    }

    Object.assign(this, center);
  }
}
