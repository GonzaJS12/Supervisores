import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RolUsuario } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AgentesService } from './agentes.service';

describe('AgentesService alcance territorial', () => {
  let service: AgentesService;

  const prisma = {
    usuario: { findUnique: jest.fn() },
    agenteSanitario: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    areaOperativa: { findUnique: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentesService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get(AgentesService);
  });

  it('rechaza con 403 si un SUPERVISOR consulta un agente de otra área', async () => {
    prisma.agenteSanitario.findUnique.mockResolvedValue({
      id: 10,
      areaOperativaId: 2,
      nombre: 'Agente',
      apellido: 'Otro',
      areaOperativa: { id: 2, nombre: 'Area 2' },
      sector: null,
    });
    prisma.usuario.findUnique.mockResolvedValue({
      id: 5,
      rol: RolUsuario.SUPERVISOR,
      activo: true,
      areaOperativaId: 1,
    });

    await expect(
      service.buscarPorIdParaUsuario(10, 5, RolUsuario.SUPERVISOR),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rechaza con 403 si un SUPERVISOR lista agentes de otra área', async () => {
    prisma.usuario.findUnique.mockResolvedValue({
      id: 5,
      rol: RolUsuario.SUPERVISOR,
      activo: true,
      areaOperativaId: 1,
    });

    await expect(
      service.listarPorAreaParaUsuario(99, 5, RolUsuario.SUPERVISOR),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
