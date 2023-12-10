import { All, Controller, Req } from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service';
import { Request } from 'express';

@Controller()
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  // Handle all HTTP methods ('All') for incoming requests
  @All('*')
  async handleRequest(@Req() req: Request) {
    let requestBody = null;

    // Extract the request body for POST and PUT requests
    if (req.method === 'POST' || req.method === 'PUT') {
      requestBody = req.body;
    }

    // Reroute the request based on the path and request data
    const response = await this.rerouteRequest(req.path, requestBody);
    return response;
  }

  // Reroute requests to different services based on the request path
  private async rerouteRequest(path: string, data: any) {
    let response;
    switch (true) {
      // Route to user-related microservice
      case path.startsWith('/user'):
        response = await this.apiGatewayService.rerouteToService(
          path,
          data,
          'user',
        );
        return response;

      // Route to other services or endpoints
      case path.startsWith('/center'):
        response = await this.apiGatewayService.rerouteToService(
          path,
          data,
          'center',
        );
        return response;
      case path.startsWith('/task'):
        response = await this.apiGatewayService.rerouteToService(
          path,
          data,
          'task',
        );
        return response;

      case path.startsWith('/front'):
        response = await this.apiGatewayService.rerouteToService(
          path,
          data,
          'front',
        );
        return response;
    }
  }
}
