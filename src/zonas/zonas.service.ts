import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ZonasService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async listar() {
    return this.prisma.zona.findMany({
      where: {
        activo: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });
  }
}