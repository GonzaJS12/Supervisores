import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  PrismaService,
} from '../prisma/prisma.service';

import {
  CrearAgenteDto,
} from './dto/crear-agente.dto';

import {
  ActualizarAgenteDto,
} from './dto/actualizar-agente.dto';

@Injectable()
export class AgentesService {
  constructor(
    private readonly prisma:
      PrismaService,
  ) {}

  /*
   * CREAR
   */

  async crear(
    dto: CrearAgenteDto,
  ) {
    const area =
      await this.prisma.areaOperativa.findUnique({
        where: {
          id: dto.areaOperativaId,
        },
      });

    if (
      !area ||
      !area.activo
    ) {
      throw new NotFoundException(
        'El área operativa no existe o está inactiva',
      );
    }

    return this.prisma.agenteSanitario.create({
      data: {
        nombre:
          dto.nombre,

        apellido:
          dto.apellido,

        documento:
          dto.documento,

        legajo:
          dto.legajo,

        areaOperativaId:
          dto.areaOperativaId,
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

  /*
   * LISTAR TODOS
   *
   * Incluimos activos e inactivos
   * para que posteriormente podamos
   * reactivar un agente.
   */

  async listar() {
    return this.prisma.agenteSanitario.findMany({
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
   * BUSCAR POR ID
   */

  async buscarPorId(
    id: number,
  ) {
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

  /*
   * LISTAR POR ÁREA
   *
   * Acá sí mantenemos activo:true.
   *
   * Esto evita que un agente dado
   * de baja aparezca en selectores
   * utilizados para nuevas
   * supervisiones.
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

    if (
      !area ||
      !area.activo
    ) {
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

  /*
   * ACTUALIZAR DATOS
   */

  async actualizar(
    id: number,
    dto: ActualizarAgenteDto,
  ) {
    const agente =
      await this.prisma.agenteSanitario.findUnique({
        where: {
          id,
        },
      });

    if (!agente) {
      throw new NotFoundException(
        'El agente sanitario no existe',
      );
    }

    /*
     * Si cambia el área,
     * verificamos que exista
     * y esté activa.
     */

    if (
      dto.areaOperativaId !==
      undefined
    ) {
      const area =
        await this.prisma.areaOperativa.findUnique({
          where: {
            id:
              dto.areaOperativaId,
          },
        });

      if (
        !area ||
        !area.activo
      ) {
        throw new NotFoundException(
          'El área operativa no existe o está inactiva',
        );
      }
    }

    return this.prisma.agenteSanitario.update({
      where: {
        id,
      },

      data: {
        nombre:
          dto.nombre,

        apellido:
          dto.apellido,

        documento:
          dto.documento,

        legajo:
          dto.legajo,

        areaOperativaId:
          dto.areaOperativaId,
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

  /*
   * ACTIVAR / DESACTIVAR
   */

  async cambiarEstado(
    id: number,
    activo: boolean,
  ) {
    const agente =
      await this.prisma.agenteSanitario.findUnique({
        where: {
          id,
        },
      });

    if (!agente) {
      throw new NotFoundException(
        'El agente sanitario no existe',
      );
    }

    /*
     * Si queremos ACTIVAR
     * nuevamente al agente,
     * comprobamos que su área
     * operativa siga activa.
     */

    if (activo) {
      const area =
        await this.prisma.areaOperativa.findUnique({
          where: {
            id:
              agente.areaOperativaId,
          },
        });

      if (
        !area ||
        !area.activo
      ) {
        throw new NotFoundException(
          'No se puede activar el agente porque su área operativa no existe o está inactiva',
        );
      }
    }

    return this.prisma.agenteSanitario.update({
      where: {
        id,
      },

      data: {
        activo,
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
}