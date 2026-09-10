import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  RolUsuario,
} from '@prisma/client';

import {
  PrismaService,
} from '../prisma/prisma.service';

@Injectable()
export class AgentesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /*
   * Obtiene el área operativa asignada
   * a un supervisor.
   */
  private async obtenerAreaSupervisor(
    usuarioId: number,
  ) {
    const usuario =
      await this.prisma.usuario.findUnique({
        where: {
          id: usuarioId,
        },

        select: {
          id: true,
          rol: true,
          activo: true,
          areaOperativaId: true,
        },
      });

    if (
      !usuario ||
      !usuario.activo
    ) {
      throw new ForbiddenException(
        'El usuario no está habilitado',
      );
    }

    if (
      usuario.rol !==
      RolUsuario.SUPERVISOR
    ) {
      throw new ForbiddenException(
        'El usuario no es supervisor',
      );
    }

    if (
      usuario.areaOperativaId == null
    ) {
      throw new ForbiddenException(
        'El supervisor no tiene un área operativa asignada',
      );
    }

    return usuario.areaOperativaId;
  }

  /*
   * LISTADO PRINCIPAL PAGINADO
   *
   * ADMIN:
   * todos los agentes.
   *
   * SUPERVISOR:
   * solamente agentes de su área.
   */
  async listarParaUsuario(
    usuarioId: number,
    rol: RolUsuario,
    page = 1,
    limit = 15,
  ) {
    /*
     * Evitamos páginas negativas,
     * cero o valores inválidos.
     */
    const pagina =
      Number.isInteger(page) &&
      page > 0
        ? page
        : 1;

    /*
     * Nunca permitimos más de
     * 15 registros por página.
     */
    const limite =
      Number.isInteger(limit) &&
      limit > 0
        ? Math.min(limit, 15)
        : 15;

    /*
     * ADMIN no lleva filtro de área.
     *
     * SUPERVISOR queda restringido
     * a su área asignada.
     */
    let where = {};

    if (
      rol ===
      RolUsuario.SUPERVISOR
    ) {
      const areaOperativaId =
        await this.obtenerAreaSupervisor(
          usuarioId,
        );

      where = {
        areaOperativaId,
      };
    }

    const skip =
      (pagina - 1) *
      limite;

    /*
     * count + findMany se ejecutan
     * juntos para obtener los datos
     * y el total correspondiente
     * al mismo filtro.
     */
    const [
      total,
      agentes,
    ] =
      await this.prisma.$transaction([
        this.prisma.agenteSanitario
          .count({
            where,
          }),

        this.prisma.agenteSanitario
          .findMany({
            where,

            skip,

            take: limite,

            include: {
              areaOperativa: {
                select: {
                  id: true,
                  externalAreaId:
                    true,
                  nombre: true,
                },
              },

              sector: {
                select: {
                  id: true,
                  externalSectorId:
                    true,
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
          }),
      ]);

    const totalPages =
      total === 0
        ? 0
        : Math.ceil(
            total / limite,
          );

    return {
      data: agentes,

      meta: {
        page: pagina,
        limit: limite,
        total,
        totalPages,
      },
    };
  }

  /*
   * LISTAR TODOS
   *
   * Se conserva sin paginación
   * para usos internos que puedan
   * necesitar el listado completo.
   */
  async listar() {
    return this.prisma.agenteSanitario
      .findMany({
        include: {
          areaOperativa: {
            select: {
              id: true,
              externalAreaId:
                true,
              nombre: true,
            },
          },

          sector: {
            select: {
              id: true,
              externalSectorId:
                true,
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
   * BUSCAR POR ID SEGÚN USUARIO
   */
  async buscarPorIdParaUsuario(
    id: number,
    usuarioId: number,
    rol: RolUsuario,
  ) {
    const agente =
      await this.buscarPorId(
        id,
      );

    if (
      rol ===
      RolUsuario.ADMIN
    ) {
      return agente;
    }

    const areaSupervisor =
      await this.obtenerAreaSupervisor(
        usuarioId,
      );

    if (
      agente.areaOperativaId !==
      areaSupervisor
    ) {
      throw new ForbiddenException(
        'No tiene permiso para acceder a un agente de otra área operativa',
      );
    }

    return agente;
  }

  /*
   * BUSCAR POR ID LOCAL
   */
  async buscarPorId(
    id: number,
  ) {
    const agente =
      await this.prisma.agenteSanitario
        .findUnique({
          where: {
            id,
          },

          include: {
            areaOperativa: {
              select: {
                id: true,
                externalAreaId:
                  true,
                nombre: true,
              },
            },

            sector: {
              select: {
                id: true,
                externalSectorId:
                  true,
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
   * LISTAR POR ÁREA SEGÚN USUARIO
   */
  async listarPorAreaParaUsuario(
    areaOperativaId: number,
    usuarioId: number,
    rol: RolUsuario,
  ) {
    if (
      rol ===
      RolUsuario.ADMIN
    ) {
      return this.listarPorArea(
        areaOperativaId,
      );
    }

    const areaSupervisor =
      await this.obtenerAreaSupervisor(
        usuarioId,
      );

    if (
      areaSupervisor !==
      areaOperativaId
    ) {
      throw new ForbiddenException(
        'No tiene permiso para consultar agentes de otra área operativa',
      );
    }

    return this.listarPorArea(
      areaOperativaId,
    );
  }

  /*
   * LISTAR AGENTES ACTIVOS POR ÁREA
   *
   * Este endpoint se mantiene
   * SIN paginación porque se utiliza
   * para cargar agentes en formularios.
   *
   * El areaOperativaId recibido es
   * nuestro ID local de PostgreSQL.
   */
  async listarPorArea(
    areaOperativaId: number,
  ) {
    const area =
      await this.prisma.areaOperativa
        .findUnique({
          where: {
            id:
              areaOperativaId,
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

    return this.prisma.agenteSanitario
      .findMany({
        where: {
          areaOperativaId,
          activo: true,
        },

        include: {
          sector: {
            select: {
              id: true,
              externalSectorId:
                true,
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