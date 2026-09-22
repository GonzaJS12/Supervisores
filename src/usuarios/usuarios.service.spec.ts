import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RolUsuario } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsuariosService } from './usuarios.service';

describe('UsuariosService.cambiarEstado', () => {
  let service: UsuariosService;
  const prisma = {
    usuario: {
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get(UsuariosService);
  });

  it('rechaza que un administrador se desactive a sí mismo', async () => {
    prisma.usuario.findUnique.mockResolvedValue({
      id: 1,
      rol: RolUsuario.ADMIN,
      activo: true,
    });

    await expect(service.cambiarEstado(1, false, 1)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.usuario.update).not.toHaveBeenCalled();
  });

  it('rechaza desactivar al último administrador activo', async () => {
    prisma.usuario.findUnique.mockResolvedValue({
      id: 2,
      rol: RolUsuario.ADMIN,
      activo: true,
    });
    prisma.usuario.count.mockResolvedValue(1);

    await expect(service.cambiarEstado(2, false, 1)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.usuario.update).not.toHaveBeenCalled();
  });

  it('permite desactivar a otro administrador si queda al menos uno activo', async () => {
    prisma.usuario.findUnique.mockResolvedValue({
      id: 2,
      rol: RolUsuario.ADMIN,
      activo: true,
    });
    prisma.usuario.count.mockResolvedValue(2);
    prisma.usuario.update.mockResolvedValue({ id: 2, activo: false });

    await expect(service.cambiarEstado(2, false, 1)).resolves.toEqual({
      id: 2,
      activo: false,
    });
  });

  it('no aplica el control de último admin al reactivar', async () => {
    prisma.usuario.findUnique.mockResolvedValue({
      id: 2,
      rol: RolUsuario.ADMIN,
      activo: false,
    });
    prisma.usuario.update.mockResolvedValue({ id: 2, activo: true });

    await service.cambiarEstado(2, true, 1);

    expect(prisma.usuario.count).not.toHaveBeenCalled();
    expect(prisma.usuario.update).toHaveBeenCalled();
  });

  it('lanza NotFound si el usuario no existe', async () => {
    prisma.usuario.findUnique.mockResolvedValue(null);

    await expect(service.cambiarEstado(9, false, 1)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
