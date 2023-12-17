export class FillCenterDto {
  centerId: number;
  numberOfTasksToFill: number;
  frontId: number;
  isCenterNew: boolean;

  constructor(
    centerId: number,
    numberOfTasksToFill: number,
    frontId: number,
    isCenterNew: boolean,
  ) {
    if (
      centerId === undefined ||
      numberOfTasksToFill === undefined ||
      frontId === undefined
    ) {
      throw new Error(
        'All required properties (centerId, numberOfTasksToFill, frontId) must be provided with correct types.',
      );
    }

    this.centerId = centerId;
    this.numberOfTasksToFill = numberOfTasksToFill;
    this.frontId = frontId;
    this.isCenterNew = isCenterNew;
  }
}
