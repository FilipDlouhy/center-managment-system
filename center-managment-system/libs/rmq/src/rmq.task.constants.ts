export const TASK_QUEUE = {
  queueName: 'task_service_queue',
  url: 'amqp://guest:guest@localhost:5672',
  serviceName: 'task_service',
};
export const TASK_MESSAGES = {
  createTask: 'task.created',
  getAllTasks: 'tasks.getAll',
  getTaskAdmin: 'task.getTaskAdmin',
  getTaskUser: 'task.getTaskUser',
  updateTaskState: 'task.updateState',
  deleteTask: 'task.delete',
  getBestTaskForFront: 'task.getBestTaskForFront',
  findNextTaskToDoInFront: 'task.findNextTaskToDoInFront',
  addFrontToTask: 'task.addFrontToTask',
  deleteFrontFromTasks: 'task.deleteFrontFromTasks',
  deleteTasksWithoutUser: 'task.deleteTasks',
  sendTaskToDoAfterRestart: 'task.sendTaskToDoAfterRestart',
  getUsersTasks: 'users.getUsersTasks',
  getUsersTasksCurrent: 'users.getUsersTasksCurrent',
};
