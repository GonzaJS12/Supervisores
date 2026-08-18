import {ConflictException, Injectable, NotFoundException} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearAgenteDto } from './dto/crear-agente.dto';

@Injectable()
export class AgentesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async crear(dto: CrearAgenteDto) {
    const area = await this.prisma.areaOperativa.findUnique({
      where: {
        id: dto.areaOperativaId,
      },
    });

    if (!area || !area.activo) {
      throw new NotFoundException(
        'El área operativa no existe o está inactiva',
      );
    }

    return this.prisma.agenteSanitario.create({
      data: {
        nombre: dto.nombre,
        apellido: dto.apellido,
        documento: dto.documento,
        legajo: dto.legajo,
        areaOperativaId: dto.areaOperativaId,
      },
      include: {
        areaOperativa: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });
  }

  async listar() {
    return this.prisma.agenteSanitario.findMany({
      where: {
        activo: true,
      },
      include: {
        areaOperativa: {
          select: {
            id: true,
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

  async listarPorArea(areaOperativaId: number) {
    const area = await this.prisma.areaOperativa.findUnique({
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