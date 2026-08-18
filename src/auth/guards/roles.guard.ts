import {CanActivate, ExecutionContext, Injectable, ForbiddenException} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolUsuario } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean {
    const roles = this.reflector.getAllAndOverride<RolUsuario[]>(
      ROLES_KEY,
      [
        context.getHandler(),
        context.getClass(),
      ],
    );

    if (!roles || roles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const usuario = request.user;

    if (!usuario){
      return false;
    }
    if (!roles.includes(usuario.rol)){
      throw new ForbiddenException(
        'No tiene permiso para realizar esta operacion');
    }

    return true;
  }
}