import { ConflictException, Injectable, NotFoundException} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearSectorDto } from './dto/crear-sector.dto';

@Injectable()
export class SectoresService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async crear(dto: CrearSectorDto) {
    const area = await this.prisma.areaOperativa.findUnique({
      where: {
        id: dto.areaOperativaId,
      },
    });

    if (!area || !area.activo) {
      throw new NotFoundException(
        'El área operativa no existe o está inactiva',
      );
    }

    const sectorExistente =
      await this.prisma.sector.findUnique({
        where: {
          areaOperativaId_numero: {
            areaOperativaId: dto.areaOperativaId,
            numero: dto.numero,
          },
        },
      });

    if (sectorExistente) {
      throw new ConflictException(
        'Ya existe ese número de sector dentro del área operativa',
      );
    }

    return this.prisma.sector.create({
      data: {
        numero: dto.numero,
        nombre: dto.nombre,
        areaOperativaId: dto.areaOperativaId,
      },
    });
  }

  async listar() {
    return this.prisma.sector.findMany({
      where: {
        activo: true,
      },
      include: {
        areaOperativa: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: [
        {
          areaOperativaId: 'asc',
        },
        {
          numero: 'asc',
        },
      ],
    });
  }

  async listarPorArea(areaOperativaId: number) {
    const area = await this.prisma.areaOperativa.findUnique({
      where: {
        id: areaOperativaId,
      },
    });

    if (!area || !area.activo) {
      throw new NotFoundException(
        'El área operativa no existe o está inactiva',
      );
    }

    return this.prisma.sector.findMany({
      where: {
        areaOperativaId,
        activo: true,
      },
      orderBy: {
        numero: 'asc',
      },
    });
  }
}