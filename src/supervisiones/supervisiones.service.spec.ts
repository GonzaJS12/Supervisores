import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DecisionGestion } from '@prisma/client';
import { SupervisionesService } from './supervisiones.service';
import { PrismaService } from '../prisma/prisma.service';
import { CrearSupervisionDto } from './dto/crear-supervision.dto';

describe('SupervisionesService', () => {
  let service: SupervisionesService;

  const prisma = {
    usuario: {
      findUnique: jest.fn(),
    },
    agenteSanitario: {
      findUnique: jest.fn(),
    },
    areaOperativa: {
      findUnique: jest.fn(),
    },
    sector: {
      findUnique: jest.fn(),
    },
    criterioEvaluacion: {
      findMany: jest.fn(),
    },
  };

  const dto: CrearSupervisionDto = {
    agenteSanitarioId: 1,
    areaOperativaId: 2,
    sectorId: 3,
    fecha: '2026-01-15T12:00:00.000Z',
    decisionGestion: DecisionGestion.NO_REQUIERE,
    evaluaciones: [
      {
        criterioId: 10,
        puntuacion: 4,
      },
    ],
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma.usuario.findUnique.mockResolvedValue({
      id: 5,
      activo: true,
    });
    prisma.agenteSanitario.findUnique.mockResolvedValue({
      id: 1,
      activo: true,
      areaOperativaId: 2,
    });
    prisma.areaOperativa.findUnique.mockResolvedValue({
      id: 2,
      activo: true,
    });
    prisma.sector.findUnique.mockResolvedValue({
      id: 3,
      activo: true,
      areaOperativaId: 2,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupervisionesService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<SupervisionesService>(SupervisionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rechaza criterios de un bloque inactivo', async () => {
    prisma.criterioEvaluacion.findMany.mockResolvedValue([]);

    await expect(service.crear(dto, 5)).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(prisma.criterioEvaluacion.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          activo: true,
          bloque: {
            activo: true,
          },
        }),
      }),
    );
  });
});
