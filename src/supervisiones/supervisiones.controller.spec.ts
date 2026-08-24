import { Test, TestingModule } from '@nestjs/testing';
import { SupervisionesController } from './supervisiones.controller';

describe('SupervisionesController', () => {
  let controller: SupervisionesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupervisionesController],
    }).compile();

    controller = module.get<SupervisionesController>(SupervisionesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
