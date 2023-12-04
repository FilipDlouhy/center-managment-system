export const TASK_QUEUE = {
  queueName: 'task_service_queue',
  url: 'amqp://guest:guest@localhost:5672',
  serviceName: 'task_service',
};
export const TASK_MESSAGES = {
  createTask: 'task.created',
  getAllTasks: 'tasks.getAll',
  getTask: 'task.get',
  updateTask: 'task.update',
  deleteTask: 'task.delete',
};
