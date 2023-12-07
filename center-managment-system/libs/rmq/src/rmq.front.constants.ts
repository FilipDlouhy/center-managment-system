export const FRONT_QUEUE = {
  queueName: 'front_service_queue',
  url: 'amqp://guest:guest@localhost:5672',
  serviceName: 'front_service',
};
export const FRONT_MESSAGES = {
  frontCreate: 'front.create',
  getAllFronts: 'front.getAll',
  getFront: 'front.get',
  deleteFront: 'front.delete',
  updateFrontLength: 'front.updateLength',
  updateFrontTasksLength: 'front.updateTaskLength',
  getFrontForTask: 'front.getFrontForTask',
};
