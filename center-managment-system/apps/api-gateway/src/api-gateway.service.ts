import { transformToCamelCase } from '@app/common';
import { USER_MESSAGES, USER_QUEUE } from '@app/rmq';
import { CENTER_MESSAGES, CENTER_QUEUE } from '@app/rmq/rmq.center.constants';
import { FRONT_MESSAGES, FRONT_QUEUE } from '@app/rmq/rmq.front.constants';
import { TASK_MESSAGES, TASK_QUEUE } from '@app/rmq/rmq.task.constants';
import { Inject, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ApiGatewayService {
  constructor(
    @Inject(USER_QUEUE.serviceName)
    private readonly userClient: ClientProxy,
    @Inject(CENTER_QUEUE.serviceName)
    private readonly centerClient: ClientProxy,
    @Inject(FRONT_QUEUE.serviceName)
    private readonly frontClient: ClientProxy,
    @Inject(TASK_QUEUE.serviceName)
    private readonly taskClient: ClientProxy,
  ) {}

  // Route incoming requests to the appropriate user-related microservice operation
  async rerouteToService(path, data, service) {
    const { camelCasedString, number } = transformToCamelCase(path);
    let messageType;
    let client: ClientProxy;
    if (service === 'user') {
      client = this.userClient;
      messageType = USER_MESSAGES[camelCasedString];
    } else if (service === 'center') {
      client = this.centerClient;
      messageType = CENTER_MESSAGES[camelCasedString];
    } else if (service === 'front') {
      client = this.frontClient;
      messageType = FRONT_MESSAGES[camelCasedString];
    } else if (service === 'task') {
      client = this.taskClient;
      messageType = TASK_MESSAGES[camelCasedString];
    }

    let dataToSend = {};

    // Prepare data to send based on the request path and payload
    if (data && number) {
      dataToSend = { id: number, data: data != null };
    } else if (number && data == null) {
      dataToSend = number;
    } else if (data) {
      dataToSend = data;
    }
    // Send the message to the user microservice

    try {
      return dataToSend
        ? await client.send(messageType, dataToSend).toPromise()
        : await client.send(messageType, {}).toPromise();
    } catch (error) {
      console.error('Error received from microservice:', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
