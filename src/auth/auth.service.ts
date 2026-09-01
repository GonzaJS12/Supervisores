import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';

import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const usuario =
      await this.prisma.usuario.findUnique({
        where: {
          email: dto.email,
        },
      });

    // 1. Verificamos que el usuario exista
    if (!usuario) {
      throw new UnauthorizedException(
        'Credenciales inválidas',
      );
    }

    // 2. Verificamos la contraseña
    const passwordValida =
      await bcrypt.compare(
        dto.password,
        usuario.passwordHash,
      );

    if (!passwordValida) {
      throw new UnauthorizedException(
        'Credenciales inválidas',
      );
    }

    // 3. Verificamos que el usuario esté activo
    if (!usuario.activo) {
      throw new UnauthorizedException(
        'Usuario inactivo',
      );
    }

    // 4. Generamos el contenido del token
    const payload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    };

    // 5. Generamos el JWT
    const accessToken =
      await this.jwtService.signAsync(
        payload,
      );

    // 6. Respondemos al frontend
    return {
      accessToken,

      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
      },
    };
  }
}