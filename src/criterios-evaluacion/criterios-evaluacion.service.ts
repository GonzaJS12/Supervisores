import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearCriterioDto } from './dto/crear-criterio.dto';
import { ActualizarCriterioDto } from './dto/actualizar-criterio.dto';

@Injectable()
export class CriteriosEvaluacionService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async listar() {
    return this.prisma.criterioEvaluacion.findMany({
      orderBy: [
        {
          bloque: {
            orden: 'asc',
          },
        },
        {
          orden: 'asc',
        },
      ],
      include: {
        bloque: true,
      },
    });
  }

  async listarPorBloque(bloqueId: number) {
    return this.prisma.criterioEvaluacion.findMany({
      where: {
        bloqueId,
      },
      orderBy: {
        orden: 'asc',
      },
    });
  }

  async buscarPorId(id: number) {
    const criterio =
      await this.prisma.criterioEvaluacion.findUnique({
        where: { id },
        include: {
          bloque: true,
        },
      });

    if (!criterio) {
      throw new NotFoundException(
        'El criterio de evaluación no existe',
      );
    }

    return criterio;
  }

  async crear(dto: CrearCriterioDto) {
    const bloque =
      await this.prisma.bloqueEvaluacion.findUnique({
        where: {
          id: dto.bloqueId,
        },
      });

    if (!bloque) {
      throw new NotFoundException(
        'El bloque de evaluación no existe',
      );
    }

    return this.prisma.criterioEvaluacion.create({
      data: {
        bloqueId: dto.bloqueId,
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        orden: dto.orden,
      },
    });
  }

  async actualizar(
    id: number,
    dto: ActualizarCriterioDto,
  ) {
    const criterio =
      await this.prisma.criterioEvaluacion.findUnique({
        where: { id },
      });

    if (!criterio) {
      throw new NotFoundException(
        'El criterio de evaluación no existe',
      );
    }

    if (dto.bloqueId) {
      const bloque =
        await this.prisma.bloqueEvaluacion.findUnique({
          where: {
            id: dto.bloqueId,
          },
        });

      if (!bloque) {
        throw new NotFoundException(
          'El bloque de evaluación no existe',
        );
      }
    }

    return this.prisma.criterioEvaluacion.update({
      where: { id },
      data: dto,
    });
  }
}