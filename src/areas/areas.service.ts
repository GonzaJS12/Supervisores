import { ConflictException, Injectable} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearAreaDto } from './dto/crear-area.dto';

@Injectable()
export class AreasService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async crear(dto: CrearAreaDto) {
    const existente = await this.prisma.areaOperativa.findUnique({
      where: {
        nombre: dto.nombre,
      },
    });

    if (existente) {
      throw new ConflictException(
        'Ya existe un área operativa con ese nombre',
      );
    }

    return this.prisma.areaOperativa.create({
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
      },
    });
  }

  async listar() {
    return this.prisma.areaOperativa.findMany({
      where: {
        activo: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });
  }
}