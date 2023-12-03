import { NestFactory } from '@nestjs/core';
import { CentersModule } from './centers.module';

async function bootstrap() {
  const app = await NestFactory.create(CentersModule);
  await app.listen(3000);
}
bootstrap();
