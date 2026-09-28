import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolUsuario } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  };

  const guard = new RolesGuard(reflector as unknown as Reflector);

  function contextConUsuario(usuario: { id: number; rol: RolUsuario } | undefined) {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user: usuario }),
      }),
    } as never;
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('permite el acceso si no hay roles requeridos', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(contextConUsuario({ id: 1, rol: RolUsuario.SUPERVISOR }))).toBe(
      true,
    );
  });

  it('rechaza con ForbiddenException si el rol no está permitido', () => {
    reflector.getAllAndOverride.mockReturnValue([RolUsuario.ADMIN]);

    expect(() =>
      guard.canActivate(
        contextConUsuario({ id: 2, rol: RolUsuario.SUPERVISOR }),
      ),
    ).toThrow(ForbiddenException);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, expect.any(Array));
  });

  it('permite el acceso si el usuario tiene un rol requerido', () => {
    reflector.getAllAndOverride.mockReturnValue([
      RolUsuario.ADMIN,
      RolUsuario.SUPERVISOR,
    ]);

    expect(
      guard.canActivate(
        contextConUsuario({ id: 3, rol: RolUsuario.SUPERVISOR }),
      ),
    ).toBe(true);
  });

  it('devuelve false si no hay usuario autenticado', () => {
    reflector.getAllAndOverride.mockReturnValue([RolUsuario.ADMIN]);

    expect(guard.canActivate(contextConUsuario(undefined))).toBe(false);
  });
});
