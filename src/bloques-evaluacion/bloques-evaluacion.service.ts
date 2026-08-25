import { ConflictException, Injectable, NotFoundException} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearBloqueDto } from './dto/crear-bloque.dto';
import { ActualizarBloqueDto } from './dto/actualizar-bloque.dto';

@Injectable()
export class BloquesEvaluacionService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async listar() {
    return this.prisma.bloqueEvaluacion.findMany({
      orderBy: {
        orden: 'asc',
      },
      include: {
        criterios: {
          orderBy: {
            orden: 'asc',
          },
        },
      },
    });
  }

  async buscarPorId(id: number) {
    const bloque =
      await this.prisma.bloqueEvaluacion.findUnique({
        where: { id },
        include: {
          criterios: {
            orderBy: {
              orden: 'asc',
            },
          },
        },
      });

    if (!bloque) {
      throw new NotFoundException(
        'El bloque de evaluación no existe',
      );
    }

    return bloque;
  }

  async crear(dto: CrearBloqueDto) {
    const existente =
      await this.prisma.bloqueEvaluacion.findUnique({
        where: {
          nombre: dto.nombre,
        },
      });

    if (existente) {
      throw new ConflictException(
        'Ya existe un bloque con ese nombre',
      );
    }

    return this.prisma.bloqueEvaluacion.create({
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        orden: dto.orden,
      },
    });
  }

  async actualizar(
    id: number,
    dto: ActualizarBloqueDto,
  ) {
    const bloque =
      await this.prisma.bloqueEvaluacion.findUnique({
        where: { id },
      });

    if (!bloque) {
      throw new NotFoundException(
        'El bloque de evaluación no existe',
      );
    }

    if (dto.nombre) {
      const existente =
        await this.prisma.bloqueEvaluacion.findFirst({
          where: {
            nombre: dto.nombre,
            NOT: {
              id,
            },
          },
        });

      if (existente) {
        throw new ConflictException(
          'Ya existe otro bloque con ese nombre',
        );
      }
    }

    return this.prisma.bloqueEvaluacion.update({
      where: { id },
      data: dto,
    });
  }
}