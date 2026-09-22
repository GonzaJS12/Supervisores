import { Test, TestingModule } from '@nestjs/testing';
import { AgentesService } from './agentes.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AgentesService', () => {
  let service: AgentesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentesService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AgentesService>(AgentesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
