import { Test, TestingModule } from '@nestjs/testing';
import { SupervisionesController } from './supervisiones.controller';
import { SupervisionesService } from './supervisiones.service';

describe('SupervisionesController', () => {
  let controller: SupervisionesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupervisionesController],
      providers: [
        {
          provide: SupervisionesService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<SupervisionesController>(
      SupervisionesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
