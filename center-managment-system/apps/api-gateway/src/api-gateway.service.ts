import { transformToCamelCase } from '@app/common';
import { USER_MESSAGES, USER_QUEUE } from '@app/rmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ApiGatewayService {
  private readonly logger = new Logger(ApiGatewayService.name);

  constructor(
    @Inject(USER_QUEUE.serviceName)
    private readonly userClient: ClientProxy,
  ) {}

  // Route incoming requests to the appropriate user-related microservice operation
  async rerouteToUserService(path, data) {
    const { camelCasedString, number } = transformToCamelCase(path.slice(6));
    const messageType = USER_MESSAGES[camelCasedString];
    let dataToSend = {};

    // Prepare data to send based on the request path and payload
    if (data && number) {
      dataToSend = { id: number, data: data != null };
    } else if (number && data == null) {
      dataToSend = number;
    }

    // Send the message to the user microservice
    return dataToSend
      ? this.userClient.send(messageType, dataToSend).toPromise()
      : this.userClient.send(messageType, {}).toPromise();
  }

  // Test method to send a 'test' message to the user microservice
  async test() {
    return this.userClient.send('test', {}).toPromise();
  }
}
