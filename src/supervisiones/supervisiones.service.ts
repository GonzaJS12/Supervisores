import {  BadRequestException, Injectable,  NotFoundException} from '@nestjs/common';
import {  Clasificacion, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CrearSupervisionDto } from './dto/crear-supervision.dto';

@Injectable()
export class SupervisionesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  private calcularClasificacion(
    promedio: number,
  ): Clasificacion {
    if (promedio <= 2.5) {
      return Clasificacion.CRITICO;
    }

    if (promedio <= 3.5) {
      return Clasificacion.REGULAR;
    }

    if (promedio <= 4.5) {
      return Clasificacion.BUENO;
    }

    return Clasificacion.EXCELENTE;
  }

  async crear(
    dto: CrearSupervisionDto,
    supervisorId: number,
  ) {
    /*
     * 1. Verificar supervisor
     */
    const supervisor = await this.prisma.usuario.findUnique({
      where: {
        id: supervisorId,
      },
    });

    if (!supervisor || !supervisor.activo) {
      throw new NotFoundException(
        'El supervisor no existe o está inactivo',
      );
    }

    /*
     * 2. Verificar agente
     */
    const agente =
      await this.prisma.agenteSanitario.findUnique({
        where: {
          id: dto.agenteSanitarioId,
        },
      });

    if (!agente || !agente.activo) {
      throw new NotFoundException(
        'El agente sanitario no existe o está inactivo',
      );
    }

    /*
     * 3. Verificar área operativa
     */
    const area =
      await this.prisma.areaOperativa.findUnique({
        where: {
          id: dto.areaOperativaId,
        },
      });

    if (!area || !area.activo) {
      throw new NotFoundException(
        'El área operativa no existe o está inactiva',
      );
    }

    /*
     * 4. Verificar que el agente pertenezca al área
     */
    if (
      agente.areaOperativaId !==
      dto.areaOperativaId
    ) {
      throw new BadRequestException(
        'El agente sanitario no pertenece al área operativa seleccionada',
      );
    }

    /*
     * 5. Verificar sector
     */
    const sector =
      await this.prisma.sector.findUnique({
        where: {
          id: dto.sectorId,
        },
      });

    if (!sector || !sector.activo) {
      throw new NotFoundException(
        'El sector no existe o está inactivo',
      );
    }

    /*
     * 6. Verificar que el sector pertenezca al área
     */
    if (
      sector.areaOperativaId !==
      dto.areaOperativaId
    ) {
      throw new BadRequestException(
        'El sector no pertenece al área operativa seleccionada',
      );
    }

    /*
     * 7. Verificar que existan evaluaciones
     */
    if (
      !dto.evaluaciones ||
      dto.evaluaciones.length === 0
    ) {
      throw new BadRequestException(
        'La supervisión debe tener al menos una evaluación',
      );
    }

    /*
     * 8. Evitar criterios repetidos
     */
    const criterioIds =
      dto.evaluaciones.map(
        (evaluacion) => evaluacion.criterioId,
      );

    const criterioIdsUnicos =
      new Set(criterioIds);

    if (
      criterioIds.length !==
      criterioIdsUnicos.size
    ) {
      throw new BadRequestException(
        'No se puede evaluar el mismo criterio más de una vez',
      );
    }

    /*
     * 9. Obtener criterios activos
     */
    const criterios =
      await this.prisma.criterioEvaluacion.findMany({
        where: {
          id: {
            in: criterioIds,
          },
          activo: true,
        },
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
      });

    /*
     * Verificar que todos los criterios enviados
     * existan y estén activos.
     */
    if (
      criterios.length !==
      criterioIds.length
    ) {
      throw new BadRequestException(
        'Uno o más criterios no existen o están inactivos',
      );
    }

    /*
     * 10. Calcular promedio
     *
     * Todos los criterios tienen el mismo peso.
     */
    const suma = dto.evaluaciones.reduce(
      (total, evaluacion) =>
        total + evaluacion.puntuacion,
      0,
    );

    const promedio =
      suma / dto.evaluaciones.length;

    /*
     * Redondeamos a dos decimales porque
     * el campo Prisma es Decimal(4,2).
     */
    const promedioRedondeado =
      Number(promedio.toFixed(2));

    /*
     * 11. Calcular clasificación
     */
    const clasificacion =
      this.calcularClasificacion(
        promedioRedondeado,
      );

    /*
     * 12. Crear todo dentro de una transacción
     */
    return this.prisma.$transaction(
      async (tx) => {
        const supervision =
          await tx.supervision.create({
            data: {
              agenteSanitarioId:
                dto.agenteSanitarioId,

              supervisorId,

              areaOperativaId:
                dto.areaOperativaId,

              sectorId:
                dto.sectorId,

              fecha: new Date(dto.fecha),

              familiaNumero:
                dto.familiaNumero,

              rondaNumero:
                dto.rondaNumero,

              decisionGestion:
                dto.decisionGestion,

              promedio:
                new Prisma.Decimal(
                  promedioRedondeado,
                ),

              clasificacion,

              fortalezas:
                dto.fortalezas,

              oportunidadesMejora:
                dto.oportunidadesMejora,

              situacionesCriticas:
                dto.situacionesCriticas,

              recomendaciones:
                dto.recomendaciones,

              evaluaciones: {
                create: dto.evaluaciones.map(
                  (evaluacion) => {
                    const criterio =
                      criterios.find(
                        (c) =>
                          c.id ===
                          evaluacion.criterioId,
                      );

                    return {
                      criterioId:
                        evaluacion.criterioId,

                      criterioNombre:
                        criterio!.nombre,

                      criterioDescripcion:
                        criterio!.descripcion,

                      puntuacion:
                        evaluacion.puntuacion,
                    };
                  },
                ),
              },
            },

            include: {
              agenteSanitario: true,

              supervisor: {
                select: {
                  id: true,
                  nombre: true,
                  apellido: true,
                  email: true,
                  rol: true,
                },
              },

              areaOperativa: true,

              sector: true,

              evaluaciones: {
                orderBy: {
                  id: 'asc',
                },
              },
            },
          });

        return supervision;
      },
    );
  }
  async listar() {
    return this.prisma.supervision.findMany({
      orderBy: {
        fecha: 'desc',
      },

      include: {
        agenteSanitario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            documento: true,
            legajo: true,
          },
        },

        supervisor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },

        areaOperativa: {
          select: {
            id: true,
            nombre: true,
          },
        },

        sector: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });
  }
  async buscarPorId(id: number) {
    const supervision =
      await this.prisma.supervision.findUnique({
        where: {
          id,
        },

        include: {
          agenteSanitario: true,

          supervisor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
            },
          },

          areaOperativa: true,
          sector: true,
          evaluaciones: {
            orderBy: {
              id: 'asc',
            },
          },
        },
      });

    if (!supervision) {
      throw new NotFoundException(
        'La supervisión no existe',
      );
    }
    return supervision;
  }
  async listarPorAgente(
    agenteSanitarioId: number,
  ) {
    const agente =
      await this.prisma.agenteSanitario.findUnique({
        where: {
          id: agenteSanitarioId,
        },
      });

    if (!agente) {
      throw new NotFoundException(
        'El agente sanitario no existe',
      );
    }

    return this.prisma.supervision.findMany({
      where: {
        agenteSanitarioId,
      },
      orderBy: {
        fecha: 'desc',
      },

      include: {
        supervisor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        areaOperativa: {
          select: {
            id: true,
            nombre: true,
          },
        },
        sector: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });
  }
}