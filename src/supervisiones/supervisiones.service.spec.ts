import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DecisionGestion, RolUsuario } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CrearSupervisionDto } from './dto/crear-supervision.dto';
import { SupervisionesService } from './supervisiones.service';

type ConsultaCriterios = {
  where: {
    activo: boolean;
    bloque: { activo: boolean };
  };
};

describe('SupervisionesService.crear', () => {
  let service: SupervisionesService;

  const findManyCriterios = jest.fn<Promise<unknown[]>, [ConsultaCriterios]>();

  const prisma = {
    usuario: { findUnique: jest.fn() },
    agenteSanitario: { findUnique: jest.fn() },
    areaOperativa: { findUnique: jest.fn() },
    ronda: { findUnique: jest.fn() },
    sector: { findUnique: jest.fn() },
    criterioEvaluacion: { findMany: findManyCriterios },
    $transaction: jest.fn(),
  };

  const dto: CrearSupervisionDto = {
    agenteSanitarioId: 1,
    areaOperativaId: 1,
    rondaId: 1,
    fecha: '2026-09-01',
    decisionGestion: DecisionGestion.NO_REQUIERE,
    evaluaciones: [{ criterioId: 10, puntuacion: 4 }],
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma.usuario.findUnique.mockResolvedValue({
      id: 2,
      activo: true,
      rol: RolUsuario.ADMIN,
      areaOperativaId: null,
    });
    prisma.agenteSanitario.findUnique.mockResolvedValue({
      id: 1,
      activo: true,
      areaOperativaId: 1,
      sectorId: null,
    });
    prisma.areaOperativa.findUnique.mockResolvedValue({
      id: 1,
      activo: true,
    });
    prisma.ronda.findUnique.mockResolvedValue({
      id: 1,
      activo: true,
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

    service = module.get(SupervisionesService);
  });

  it('rechaza criterios cuyo bloque está inactivo', async () => {
    findManyCriterios.mockResolvedValue([]);

    await expect(service.crear(dto, 2)).rejects.toBeInstanceOf(
      BadRequestException,
    );

    const consulta = findManyCriterios.mock.calls[0][0];
    expect(consulta.where.activo).toBe(true);
    expect(consulta.where.bloque).toEqual({ activo: true });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('crea la supervisión cuando el criterio y su bloque están activos', async () => {
    findManyCriterios.mockResolvedValue([
      {
        id: 10,
        nombre: 'Criterio',
        descripcion: null,
        bloque: { id: 1, activo: true },
      },
    ]);
    prisma.$transaction.mockImplementation(
      async (callback: (tx: unknown) => Promise<unknown>) =>
        callback({
          supervision: {
            create: jest.fn().mockResolvedValue({ id: 99 }),
          },
        }),
    );

    await expect(service.crear(dto, 2)).resolves.toEqual({ id: 99 });
  });
});
