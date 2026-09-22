import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import {
  PassportStrategy,
} from '@nestjs/passport';

import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';

import {
  PrismaService,
} from '../../prisma/prisma.service';

import { requireEnv } from '../../config/env';

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
) {
  constructor(
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,

      secretOrKey: requireEnv('JWT_SECRET'),
    });
  }

  async validate(payload: {
    sub: number;
    email: string;
    rol: string;
  }) {
    const usuario =
      await this.prisma.usuario.findUnique({
        where: {
          id: payload.sub,
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

    if (!usuario) {
      throw new UnauthorizedException(
        'Usuario no encontrado',
      );
    }

    if (!usuario.activo) {
      throw new UnauthorizedException(
        'Usuario inactivo',
      );
    }

    return usuario;
  }
}