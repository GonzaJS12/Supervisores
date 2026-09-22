import { Test, TestingModule } from '@nestjs/testing';
import { SectoresService } from './sectores.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SectoresService', () => {
  let service: SectoresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SectoresService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<SectoresService>(SectoresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
