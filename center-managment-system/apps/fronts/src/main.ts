import { NestFactory } from '@nestjs/core';
import { FrontsModule } from './fronts.module';

async function bootstrap() {
  const app = await NestFactory.create(FrontsModule);
  await app.listen(3000);
}
bootstrap();
