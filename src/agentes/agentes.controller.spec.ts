import { Test, TestingModule } from '@nestjs/testing';
import { AgentesController } from './agentes.controller';

describe('AgentesController', () => {
  let controller: AgentesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgentesController],
    }).compile();

    controller = module.get<AgentesController>(AgentesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
