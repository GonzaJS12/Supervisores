import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
) {
  constructor(
    private readonly prisma: PrismaService,
  ) {
    /*
     * JWT_SECRET es obligatorio
     * para verificar los tokens.
     */
    const jwtSecret =
      process.env.JWT_SECRET?.trim();

    if (!jwtSecret) {
      throw new Error(
        'JWT_SECRET no está configurado',
      );
    }

    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,

      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: {
    sub: number;
    email: string;
    rol: string;
  }) {
    /*
     * Obtenemos siempre los datos
     * actuales del usuario desde
     * la base de datos.
     */
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

    /*
     * Este objeto queda disponible
     * como request.user en todos los
     * endpoints protegidos por JWT.
     */
    return usuario;
  }
}