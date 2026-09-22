import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RolUsuario } from '@prisma/client';
import { UsuariosService } from './usuarios.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsuariosService', () => {
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

    service = module.get<UsuariosService>(UsuariosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rechaza que un admin se desactive a sí mismo', async () => {
    prisma.usuario.findUnique.mockResolvedValue({
      id: 1,
      rol: RolUsuario.ADMIN,
      activo: true,
    });

    await expect(
      service.cambiarEstado(1, false, 1),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.usuario.update).not.toHaveBeenCalled();
  });

  it('rechaza desactivar al último administrador activo', async () => {
    prisma.usuario.findUnique.mockResolvedValue({
      id: 2,
      rol: RolUsuario.ADMIN,
      activo: true,
    });
    prisma.usuario.count.mockResolvedValue(0);

    await expect(
      service.cambiarEstado(2, false, 1),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.usuario.update).not.toHaveBeenCalled();
  });
});
