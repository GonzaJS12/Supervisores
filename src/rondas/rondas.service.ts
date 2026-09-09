import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RondasService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async listar() {
    return this.prisma.ronda.findMany({
      where: {
        activo: true,
      },
      orderBy: {
        externalRondaId: 'desc',
      },
    });
  }
}