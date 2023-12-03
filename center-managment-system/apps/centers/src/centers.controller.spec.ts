import { Test, TestingModule } from '@nestjs/testing';
import { CentersController } from './centers.controller';
import { CentersService } from './centers.service';

describe('CentersController', () => {
  let centersController: CentersController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CentersController],
      providers: [CentersService],
    }).compile();

    centersController = app.get<CentersController>(CentersController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(centersController.getHello()).toBe('Hello World!');
    });
  });
});
