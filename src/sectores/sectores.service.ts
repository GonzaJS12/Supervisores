import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { RolUsuario } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SectoresService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}
  private async obtenerAreaSupervisor(
    usuarioId: number,
  ): Promise<number> {
    const usuario =
      await this.prisma.usuario.findUnique({
        where: {
          id: usuarioId,
        },

        select: {
          id: true,
          activo: true,
          rol: true,
          areaOperativaId: true,
        },
      });

    if (
      !usuario ||
      !usuario.activo
    ) {
      throw new NotFoundException(
        'El usuario no existe o está inactivo',
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
      usuario.areaOperativaId === null
    ) {
      throw new ForbiddenException(
        'El supervisor no tiene un área operativa asignada',
      );
    }

    return usuario.areaOperativaId;
  }

  /*
   * LISTAR SECTORES SEGÚN ROL
   *
   * ADMIN:
   * todos los sectores activos.
   *
   * SUPERVISOR:
   * solamente los sectores
   * pertenecientes a su área.
   */
  async listarParaUsuario(
    usuarioId: number,
    rol: RolUsuario,
  ) {
    let areaOperativaId:
      number | undefined;

    if (
      rol === RolUsuario.SUPERVISOR
    ) {
      areaOperativaId =
        await this.obtenerAreaSupervisor(
          usuarioId,
        );
    }

    return this.prisma.sector.findMany({
      where: {
        activo: true,

        ...(areaOperativaId !== undefined
          ? {
              areaOperativaId,
            }
          : {}),
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

  /*
   * LISTAR SECTORES DE UN ÁREA
   * SEGÚN EL USUARIO AUTENTICADO.
   */
  async listarPorAreaParaUsuario(
    areaOperativaId: number,
    usuarioId: number,
    rol: RolUsuario,
  ) {
    /*
     * Si es SUPERVISOR obtenemos
     * su área desde la base.
     */
    if (
      rol === RolUsuario.SUPERVISOR
    ) {
      const areaSupervisor =
        await this.obtenerAreaSupervisor(
          usuarioId,
        );

      /*
       * Impedimos consultar
       * cualquier otra área.
       */
      if (
        areaOperativaId !==
        areaSupervisor
      ) {
        throw new ForbiddenException(
          'No puede consultar sectores de otra área operativa',
        );
      }
    }

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