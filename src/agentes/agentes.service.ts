import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AgentesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /*
   * LISTAR TODOS
   *
   * Incluye activos e inactivos.
   *
   * También devuelve el área y el sector
   * actualmente asociados al agente.
   */
  async listar() {
    return this.prisma.agenteSanitario.findMany({
      include: {
        areaOperativa: {
          select: {
            id: true,
            externalAreaId: true,
            nombre: true,
          },
        },

        sector: {
          select: {
            id: true,
            externalSectorId: true,
            numero: true,
            nombre: true,
          },
        },
      },

      orderBy: [
        {
          activo: 'desc',
        },
        {
          apellido: 'asc',
        },
        {
          nombre: 'asc',
        },
      ],
    });
  }

  /*
   * BUSCAR POR ID LOCAL
   */
  async buscarPorId(id: number) {
    const agente =
      await this.prisma.agenteSanitario.findUnique({
        where: {
          id,
        },

        include: {
          areaOperativa: {
            select: {
              id: true,
              externalAreaId: true,
              nombre: true,
            },
          },

          sector: {
            select: {
              id: true,
              externalSectorId: true,
              numero: true,
              nombre: true,
            },
          },
        },
      });

    if (!agente) {
      throw new NotFoundException(
        'El agente sanitario no existe',
      );
    }

    return agente;
  }

  /*
   * LISTAR AGENTES ACTIVOS POR ÁREA
   *
   * El areaOperativaId recibido es siempre
   * nuestro ID local de PostgreSQL.
   */
  async listarPorArea(
    areaOperativaId: number,
  ) {
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

    return this.prisma.agenteSanitario.findMany({
      where: {
        areaOperativaId,
        activo: true,
      },

      include: {
        sector: {
          select: {
            id: true,
            externalSectorId: true,
            numero: true,
            nombre: true,
          },
        },
      },

      orderBy: [
        {
          apellido: 'asc',
        },
        {
          nombre: 'asc',
        },
      ],
    });
  }
}