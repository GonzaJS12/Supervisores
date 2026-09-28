import { BadRequestException, ForbiddenException } from '@nestjs/common';
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

  const dtoBase: CrearSupervisionDto = {
    agenteSanitarioId: 1,
    areaOperativaId: 1,
    rondaId: 1,
    fecha: '2026-09-01',
    decisionGestion: DecisionGestion.NO_REQUIERE,
    evaluaciones: [{ criterioId: 10, puntuacion: 4 }],
  };

  beforeEach(async () => {
    jest.clearAllMocks();

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
    findManyCriterios.mockResolvedValue([]);

    await expect(service.crear(dtoBase, 2)).rejects.toBeInstanceOf(
      BadRequestException,
    );

    const consulta = findManyCriterios.mock.calls[0][0];
    expect(consulta.where.activo).toBe(true);
    expect(consulta.where.bloque).toEqual({ activo: true });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('crea la supervisión cuando el criterio y su bloque están activos', async () => {
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

    await expect(service.crear(dtoBase, 2)).resolves.toEqual({ id: 99 });
  });

  it('rechaza si un SUPERVISOR crea supervisión para un agente de otra área', async () => {
    prisma.usuario.findUnique.mockResolvedValue({
      id: 5,
      activo: true,
      rol: RolUsuario.SUPERVISOR,
      areaOperativaId: 1,
    });
    prisma.agenteSanitario.findUnique.mockResolvedValue({
      id: 1,
      activo: true,
      areaOperativaId: 2,
      sectorId: null,
    });

    await expect(service.crear(dtoBase, 5)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rechaza si el sector no corresponde al del agente', async () => {
    prisma.usuario.findUnique.mockResolvedValue({
      id: 5,
      activo: true,
      rol: RolUsuario.SUPERVISOR,
      areaOperativaId: 1,
    });
    prisma.agenteSanitario.findUnique.mockResolvedValue({
      id: 1,
      activo: true,
      areaOperativaId: 1,
      sectorId: 7,
    });
    prisma.areaOperativa.findUnique.mockResolvedValue({
      id: 1,
      activo: true,
    });
    prisma.ronda.findUnique.mockResolvedValue({
      id: 1,
      activo: true,
    });

    const dtoSectorIncorrecto: CrearSupervisionDto = {
      ...dtoBase,
      sectorId: 9,
    };

    await expect(service.crear(dtoSectorIncorrecto, 5)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});

describe('SupervisionesService.listarParaExportacion', () => {
  let service: SupervisionesService;

  const prisma = {
    supervision: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    delete process.env.SUPERVISIONES_EXPORT_MAX;

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

  it('exporta cuando el total no supera el límite', async () => {
    const filas = [{ id: 1 }];
    prisma.supervision.count.mockResolvedValue(2);
    prisma.supervision.findMany.mockResolvedValue(filas);

    await expect(
      service.listarParaExportacion(9, RolUsuario.SUPERVISOR),
    ).resolves.toEqual(filas);

    expect(prisma.supervision.count).toHaveBeenCalledWith({
      where: { supervisorId: 9 },
    });
    expect(prisma.supervision.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { supervisorId: 9 },
        take: 500,
      }),
    );
  });

  it('responde 400 si el total supera el límite sin cargar findMany', async () => {
    prisma.supervision.count.mockResolvedValue(501);

    await expect(
      service.listarParaExportacion(1, RolUsuario.ADMIN),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.supervision.findMany).not.toHaveBeenCalled();
  });

  it('respeta SUPERVISIONES_EXPORT_MAX del entorno', async () => {
    process.env.SUPERVISIONES_EXPORT_MAX = '3';
    prisma.supervision.count.mockResolvedValue(4);

    await expect(
      service.listarParaExportacion(1, RolUsuario.ADMIN),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.supervision.findMany).not.toHaveBeenCalled();
  });
});

