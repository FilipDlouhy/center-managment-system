export class FrontUpdateTimeAndTasksDTO {
  frontId: number;
  timeToCompleteTask: number;

  constructor(frontId: number, timeToCompleteTask: number) {
    this.frontId = frontId;
    this.timeToCompleteTask = timeToCompleteTask;
  }
}
