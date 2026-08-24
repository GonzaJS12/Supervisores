import { Test, TestingModule } from '@nestjs/testing';
import { SupervisionesService } from './supervisiones.service';

describe('SupervisionesService', () => {
  let service: SupervisionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SupervisionesService],
    }).compile();

    service = module.get<SupervisionesService>(SupervisionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
