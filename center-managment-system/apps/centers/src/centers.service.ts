import { Injectable } from '@nestjs/common';

@Injectable()
export class CentersService {
  getHello(): string {
    return 'Hello World!';
  }
}
