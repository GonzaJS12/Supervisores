import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  RolUsuario,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

import {
  PrismaService,
} from '../prisma/prisma.service';
import {
  CrearUsuarioDto,
} from './dto/crear-usuario.dto';
import {
  ModificarUsuarioDto,
} from './dto/modificar-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async crear(dto: CrearUsuarioDto) {
    const usuarioExistente =
      await this.prisma.usuario.findUnique({
        where: {
          email: dto.email,
        },
      });

    if (usuarioExistente) {
      throw new ConflictException(
        'Ya existe un usuario con ese email',
      );
    }

    let areaOperativaId: number | null =
      null;

    if (
      dto.rol === RolUsuario.SUPERVISOR
    ) {
      if (!dto.areaOperativaId) {
        throw new BadRequestException(
          'Debe asignar un área operativa al supervisor',
        );
      }

      const area =
        await this.prisma.areaOperativa.findFirst({
          where: {
            id: dto.areaOperativaId,
            activo: true,
          },
        });

      if (!area) {
        throw new BadRequestException(
          'El área operativa seleccionada no existe o está inactiva',
        );
      }

      areaOperativaId =
        dto.areaOperativaId;
    }

    const passwordHash =
      await bcrypt.hash(
        dto.password,
        10,
      );

    const usuario =
      await this.prisma.usuario.create({
        data: {
          nombre: dto.nombre,
          apellido: dto.apellido,
          email: dto.email,
          passwordHash,
          rol: dto.rol,
          areaOperativaId,
        },
        select: {
          id: true,
          nombre: true,
          apellido: true,
          email: true,
          rol: true,
          activo: true,
          areaOperativaId: true,
          areaOperativa: {
            select: {
              id: true,
              externalAreaId: true,
              nombre: true,
            },
          },
        },
      });

    return usuario;
  }

  async listar() {
    return this.prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
        activo: true,
        areaOperativaId: true,
        areaOperativa: {
          select: {
            id: true,
            externalAreaId: true,
            nombre: true,
          },
        },
        createdAt: true,
      },
      orderBy: {
        apellido: 'asc',
      },
    });
  }

  async buscarPorId(id: number) {
    const usuario =
      await this.prisma.usuario.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          nombre: true,
          apellido: true,
          email: true,
          rol: true,
          activo: true,
          areaOperativaId: true,
          areaOperativa: {
            select: {
              id: true,
              externalAreaId: true,
              nombre: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
      });

    if (!usuario) {
      throw new NotFoundException(
        'Usuario no encontrado',
      );
    }

    return usuario;
  }

  async modificar(
    id: number,
    dto: ModificarUsuarioDto,
  ) {
    /*
    * Verificamos que el usuario exista.
    */
    const usuario =
      await this.prisma.usuario.findUnique({
        where: {
          id,
        },
      });

    if (!usuario) {
      throw new NotFoundException(
        'Usuario no encontrado',
      );
    }

    /*
     * Evitamos que otro usuario tenga
     * el mismo email.
      */
    const usuarioConEmail =
      await this.prisma.usuario.findFirst({
        where: {
          email: dto.email,
          id: {
            not: id,
          },
        },
      });

    if (usuarioConEmail) {
      throw new ConflictException(
        'Ya existe un usuario con ese email',
      );
    }

    let areaOperativaId:
      number | null = null;

    /*
    * El rol NO se recibe desde el frontend.
    *
    * Utilizamos el rol que el usuario
    * ya tiene almacenado en la base.
    */
    if (
      usuario.rol ===
      RolUsuario.SUPERVISOR
    ) {
      if (!dto.areaOperativaId) {
        throw new BadRequestException(
          'Debe asignar un área operativa al supervisor',
        );
      }

      const area =
        await this.prisma.areaOperativa
          .findFirst({
            where: {
              id: dto.areaOperativaId,
              activo: true,
            },
          });

      if (!area) {
        throw new BadRequestException(
          'El área operativa seleccionada no existe o está inactiva',
        );
      }

      areaOperativaId =
        dto.areaOperativaId;
    }

    /*
    * Si es ADMIN:
    *
    * areaOperativaId queda en null.
    *
    * Si es SUPERVISOR:
    *
    * queda el área seleccionada.
    */
    return this.prisma.usuario.update({
      where: {
        id,
      },

      data: {
        nombre: dto.nombre.trim(),
        apellido: dto.apellido.trim(),
        email:
          dto.email
            .trim()
            .toLowerCase(),

        areaOperativaId,
      },

      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
        activo: true,
        areaOperativaId: true,

        areaOperativa: {
          select: {
            id: true,
            externalAreaId: true,
            nombre: true,
          },
        },

        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async cambiarEstado(
    id: number,
    activo: boolean,
  ) {
    const usuario =
      await this.prisma.usuario.findUnique({
        where: {
          id,
        },
      });

    if (!usuario) {
      throw new NotFoundException(
        'Usuario no encontrado',
      );
    }

    return this.prisma.usuario.update({
      where: {
        id,
      },
      data: {
        activo,
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
        activo: true,
        areaOperativaId: true,
        areaOperativa: {
          select: {
            id: true,
            externalAreaId: true,
            nombre: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async cambiarPassword(
    usuarioId: number,
    nuevaPassword: string,
  ) {
    const usuario =
      await this.prisma.usuario.findUnique({
        where: {
          id: usuarioId,
        },
      });

    if (!usuario) {
      throw new NotFoundException(
        'El usuario no existe',
      );
    }

    const passwordHash =
      await bcrypt.hash(
        nuevaPassword,
        10,
      );

    return this.prisma.usuario.update({
      where: {
        id: usuarioId,
      },
      data: {
        passwordHash,
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
        activo: true,
        areaOperativaId: true,
      },
    });
  }
  
  async cambiarAreaOperativa(
  usuarioId: number,
  areaOperativaId: number,
) {
  const usuario =
    await this.prisma.usuario.findUnique({
      where: {
        id: usuarioId,
      },
    });

  if (!usuario) {
    throw new NotFoundException(
      'Usuario no encontrado',
    );
  }

  if (
    usuario.rol !==
    RolUsuario.SUPERVISOR
  ) {
    throw new BadRequestException(
      'Solo se puede asignar un área operativa a un supervisor',
    );
  }

  const areaOperativa =
    await this.prisma.areaOperativa.findFirst({
      where: {
        id: areaOperativaId,
        activo: true,
      },
    });

  if (!areaOperativa) {
    throw new BadRequestException(
      'El área operativa seleccionada no existe o está inactiva',
    );
  }

  return this.prisma.usuario.update({
    where: {
      id: usuarioId,
    },
    data: {
      areaOperativaId,
    },
    select: {
      id: true,
      nombre: true,
      apellido: true,
      email: true,
      rol: true,
      activo: true,
      areaOperativaId: true,
      areaOperativa: {
        select: {
          id: true,
          externalAreaId: true,
          nombre: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });
}
}