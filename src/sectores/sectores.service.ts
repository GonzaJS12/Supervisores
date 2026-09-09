import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SectoresService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async listar() {
    return this.prisma.sector.findMany({
      where: {
        activo: true,
      },
      include: {
        areaOperativa: {
          select: {
            id: true,
            externalAreaId: true,
            nombre: true,
          },
        },
      },
      orderBy: [
        {
          areaOperativaId: 'asc',
        },
        {
          numero: 'asc',
        },
      ],
    });
  }

  async listarPorArea(areaOperativaId: number) {
    const area =
      await this.prisma.areaOperativa.findUnique({
        where: {
          id: areaOperativaId,
        },
      });

    if (!area || !area.activo) {
      throw new NotFoundException(
        'El área operativa no existe o está inactiva',
      );
    }

    return this.prisma.sector.findMany({
      where: {
        areaOperativaId,
        activo: true,
      },
      orderBy: {
        numero: 'asc',
      },
    });
  }
}