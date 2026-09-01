import { BadRequestException,ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { RolUsuario } from '@prisma/client';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(dto: CrearUsuarioDto) {
    const usuarioExistente = await this.prisma.usuario.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (usuarioExistente) {
      throw new ConflictException(
        'Ya existe un usuario con ese email',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const usuario = await this.prisma.usuario.create({
      data: {
        nombre: dto.nombre,
        apellido: dto.apellido,
        email: dto.email,
        passwordHash,
        rol: dto.rol,
      },
    });

    return {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      rol: usuario.rol,
      activo: usuario.activo,
    };
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
        createdAt: true,
        updatedAt: true,
      },
    });
  }
  async cambiarPassword(
    usuarioId: number,
    nuevaPassword: string,) {
    const usuario = await this.prisma.usuario.findUnique({
      where: {
        id: usuarioId,
      },
    });

    if (!usuario) {
      throw new NotFoundException(
        'El usuario no existe',
      );
    }

    const passwordHash = await bcrypt.hash(
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
      },
    });
  }
  async cambiarRol(
    usuarioId: number,
    nuevoRol: RolUsuario,
    administradorId: number,
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
    usuarioId === administradorId
  ) {
    throw new BadRequestException(
      'No puede modificar su propio rol',
    );
  }

  if (
    usuario.rol === nuevoRol
  ) {
    throw new BadRequestException(
      'El usuario ya posee ese rol',
    );
  }

  return this.prisma.usuario.update({
    where: {
      id: usuarioId,
    },

    data: {
      rol: nuevoRol,
    },

    select: {
      id: true,
      nombre: true,
      apellido: true,
      email: true,
      rol: true,
      activo: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
}