import { Test, TestingModule } from '@nestjs/testing';
import { SectoresController } from './sectores.controller';
import { SectoresService } from './sectores.service';

describe('SectoresController', () => {
  let controller: SectoresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SectoresController],
      providers: [
        {
          provide: SectoresService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<SectoresController>(SectoresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
