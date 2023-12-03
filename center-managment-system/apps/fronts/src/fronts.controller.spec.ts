import { Test, TestingModule } from '@nestjs/testing';
import { FrontsController } from './fronts.controller';
import { FrontsService } from './fronts.service';

describe('FrontsController', () => {
  let frontsController: FrontsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FrontsController],
      providers: [FrontsService],
    }).compile();

    frontsController = app.get<FrontsController>(FrontsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(frontsController.getHello()).toBe('Hello World!');
    });
  });
});
