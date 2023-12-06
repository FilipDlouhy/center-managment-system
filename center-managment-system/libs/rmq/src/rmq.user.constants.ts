export const USER_QUEUE = {
  queueName: 'user_service_queue',
  url: 'amqp://guest:guest@localhost:5672',
  serviceName: 'user_service',
};
export const USER_MESSAGES = {
  createUser: 'user.created',
  getAllUsers: 'users.getAll',
  getUser: 'user.get',
  updateUser: 'user.update',
  deleteUser: 'user.delete',
  userLogin: 'user.login',
  getUserForTask: 'user.getUserForTask',
};
