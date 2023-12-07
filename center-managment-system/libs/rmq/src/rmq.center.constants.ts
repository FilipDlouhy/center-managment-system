export const CENTER_QUEUE = {
  queueName: 'center_service_queue',
  url: 'amqp://guest:guest@localhost:5672',
  serviceName: 'center_service',
};
export const CENTER_MESSAGES = {
  createCenter: 'center.create',
  getAllCenters: 'center.getAll',
  getCenter: 'center.get',
  deleteCenter: 'center.delete',
  updateCenter: 'center.update',
  getCeterWithFrontId: 'center.getCeterWithFrontId',
};
