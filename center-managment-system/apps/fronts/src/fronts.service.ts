import { Injectable } from '@nestjs/common';

@Injectable()
export class FrontsService {
  getHello(): string {
    return 'Hello World!';
  }
}
