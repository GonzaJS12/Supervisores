import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Clasificacion, Prisma, RolUsuario } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CrearSupervisionDto } from './dto/crear-supervision.dto';

@Injectable()
export class SupervisionesService {
  constructor(
    private readonly prisma:
      PrismaService,
  ) {}

  /*
   * Calcula la clasificación
   * según el promedio obtenido.
   */
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

  /*
   * CREAR SUPERVISIÓN
   */
  async crear(
    dto: CrearSupervisionDto,
    supervisorId: number,
  ) {
    /*
     * 1. Verificar supervisor
     */
    const supervisor =
      await this.prisma.usuario.findUnique({
        where: {
          id: supervisorId,
        },
      });

    if (
      !supervisor ||
      !supervisor.activo
    ) {
      throw new NotFoundException(
        'El supervisor no existe o está inactivo',
      );
    }
    /*
      * Si quien crea la supervisión
      * tiene rol SUPERVISOR, debe tener
      * un área operativa asignada.
      */
      if (
        supervisor.rol ===
          RolUsuario.SUPERVISOR &&
        supervisor.areaOperativaId == null
      ) {
        throw new ForbiddenException(
          'El supervisor no tiene un área operativa asignada',
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

    if (!agente) {
      throw new NotFoundException(
        'El agente sanitario no existe',
      );
    }

    if (!agente.activo) {
      throw new BadRequestException(
        'No se puede crear una supervisión para un agente inactivo',
      );
    }
    /*
    * Un SUPERVISOR solamente puede
    * supervisar agentes pertenecientes
    * a su área operativa asignada.
    */
    if (
      supervisor.rol ===
        RolUsuario.SUPERVISOR &&
      agente.areaOperativaId !==
        supervisor.areaOperativaId
      ) {
        throw new ForbiddenException(
          'No puede supervisar un agente de otra área operativa',
        );
      }
      /*
      * Para SUPERVISOR usamos siempre
      * el área que tiene asignada.
      *
      * Para ADMIN se mantiene el área
      * enviada en el formulario.
      */
      const areaOperativaId =
        supervisor.rol ===
        RolUsuario.SUPERVISOR
          ? supervisor.areaOperativaId!
          : dto.areaOperativaId;

    /*
     * 3. Verificar área operativa
     */
    const area =
      await this.prisma.areaOperativa.findUnique({
        where: {
          id:areaOperativaId,
        },
      });

    if (
      !area ||
      !area.activo
    ) {
      throw new NotFoundException(
        'El área operativa no existe o está inactiva',
      );
    }

    /*
     * 4. Verificar que el agente
     * pertenezca al área enviada.
     */
    if (
      agente.areaOperativaId !==
      areaOperativaId
    ) {
      throw new BadRequestException(
        'El agente sanitario no pertenece al área operativa seleccionada',
      );
    }

    /*
     * 5. Verificar ronda
     */
    const ronda =
      await this.prisma.ronda.findUnique({
        where: {
          id: dto.rondaId,
        },
      });

    if (
      !ronda ||
      !ronda.activo
    ) {
      throw new NotFoundException(
        'La ronda no existe o está inactiva',
      );
    }

    /*
     * 6. Verificar sector.
     *
     * Tenemos dos casos:
     *
     * A) El agente tiene sector:
     *    debe enviarse exactamente
     *    ese mismo sector.
     *
     * B) El agente no tiene sector:
     *    no debe enviarse sectorId.
     */

    const sectorId =
      dto.sectorId ?? null;

    if (
      agente.sectorId !==
      sectorId
    ) {
      if (
        agente.sectorId === null
      ) {
        throw new BadRequestException(
          'El agente sanitario no tiene un sector asignado',
        );
      }

      throw new BadRequestException(
        'El sector seleccionado no corresponde al sector del agente sanitario',
      );
    }

    /*
     * Si existe sector,
     * verificamos que continúe
     * existiendo y esté activo.
     */
    if (sectorId !== null) {
      const sector =
        await this.prisma.sector.findUnique({
          where: {
            id: sectorId,
          },
        });

      if (
        !sector ||
        !sector.activo
      ) {
        throw new NotFoundException(
          'El sector no existe o está inactivo',
        );
      }

      /*
       * También comprobamos
       * que pertenezca al área.
       */
      if (
        sector.areaOperativaId !==
        areaOperativaId
      ) {
        throw new BadRequestException(
          'El sector no pertenece al área operativa seleccionada',
        );
      }
    }

    /*
     * 7. Verificar evaluaciones
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
        (evaluacion) =>
          evaluacion.criterioId,
      );

    const criterioIdsUnicos =
      new Set(
        criterioIds,
      );

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
     * Comprobar que todos
     * los criterios enviados
     * existen y están activos.
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
     * 10. Calcular promedio.
     *
     * Todos los criterios
     * tienen el mismo peso.
     */
    const suma =
      dto.evaluaciones.reduce(
        (
          total,
          evaluacion,
        ) =>
          total +
          evaluacion.puntuacion,
        0,
      );

    const promedio =
      suma /
      dto.evaluaciones.length;

    /*
     * Redondear a dos
     * decimales.
     */
    const promedioRedondeado =
      Number(
        promedio.toFixed(
          2,
        ),
      );

    /*
     * 11. Calcular clasificación
     */
    const clasificacion =
      this.calcularClasificacion(
        promedioRedondeado,
      );

    /*
     * 12. Crear supervisión
     * y evaluaciones dentro
     * de una transacción.
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
                areaOperativaId,

              /*
               * Puede ser un ID
               * o null.
               */
              sectorId,

              /*
               * Nueva relación
               * con Ronda.
               */
              rondaId:
                dto.rondaId,

              fecha:
                new Date(
                  dto.fecha,
                ),

              familiaNumero:
                dto.familiaNumero,

              /*
               * Dejamos de cargar
               * rondaNumero en las
               * nuevas supervisiones.
               *
               * El campo puede seguir
               * existiendo en Prisma
               * por compatibilidad con
               * datos históricos.
               */

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
                create:
                  dto.evaluaciones.map(
                    (
                      evaluacion,
                    ) => {
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
                          criterio!
                            .descripcion,

                        puntuacion:
                          evaluacion.puntuacion,
                      };
                    },
                  ),
              },
            },

            include: {
              agenteSanitario:
                true,

              supervisor: {
                select: {
                  id: true,
                  nombre: true,
                  apellido: true,
                  email: true,
                  rol: true,
                },
              },

              areaOperativa:
                true,

              sector:
                true,

              ronda:
                true,

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

  /*
   * LISTAR COMPAGINADA
   */
  async listar(
    page = 1,
    limit = 15,
  ) {
    const pagina =
      Number.isFinite(page) && page > 0
        ? Math.floor(page)
        : 1;

    const limite =
      Number.isFinite(limit) &&
      limit > 0
        ? Math.min(
            Math.floor(limit),
            15,
          )
        : 15;

    const skip =
      (pagina - 1) * limite;

    const [
      supervisiones,
      total,
    ] = await Promise.all([
      this.prisma.supervision.findMany({
        skip,
        take: limite,

        orderBy: [
          {
            fecha: 'desc',
          },
          {
            id: 'desc',
          },
        ],

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
              numero: true,
              nombre: true,
            },
          },

          ronda: {
            select: {
              id: true,
              externalRondaId: true,
              nombre: true,
            },
          },
        },
      }),

      this.prisma.supervision.count(),
    ]);

    const totalPages =
      total === 0
        ? 0
        : Math.ceil(
            total / limite,
          );

    return {
      data: supervisiones,

      meta: {
        page: pagina,
        limit: limite,
        total,
        totalPages,
      },
    };
  }

  /*
   * LISTAR POR SUPERVISOR
   */
  async listarPorSupervisor(
    supervisorId: number,
    page = 1,
    limit = 15,
  ) {
    const pagina =
      Number.isFinite(page) && page > 0
        ? Math.floor(page)
        : 1;

    const limite =
      Number.isFinite(limit) &&
      limit > 0
        ? Math.min(
            Math.floor(limit),
            15,
          )
        : 15;

    const skip =
      (pagina - 1) * limite;

    const where = {
      supervisorId,
    };

    const [
      supervisiones,
      total,
    ] = await Promise.all([
      this.prisma.supervision.findMany({
        where,

        skip,
        take: limite,

        orderBy: [
          {
            fecha: 'desc',
          },
          {
            id: 'desc',
          },
        ],

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
              numero: true,
              nombre: true,
            },
          },

          ronda: {
            select: {
              id: true,
              externalRondaId: true,
              nombre: true,
            },
          },
        },
      }),

      this.prisma.supervision.count({
        where,
      }),
    ]);

    const totalPages =
      total === 0
        ? 0
        : Math.ceil(
            total / limite,
          );

    return {
      data: supervisiones,

      meta: {
        page: pagina,
        limit: limite,
        total,
        totalPages,
      },
    };
  }

  /*
   * BUSCAR SUPERVISIÓN
   * SEGÚN USUARIO Y ROL
   */
  async buscarPorIdParaUsuario(
    id: number,
    usuarioId: number,
    rol: RolUsuario,
  ) {
    const supervision =
      await this.prisma.supervision.findFirst({
        where: {
          id,

          ...(rol ===
          RolUsuario.SUPERVISOR
            ? {
                supervisorId:
                  usuarioId,
              }
            : {}),
        },

        include: {
          agenteSanitario:
            true,

          supervisor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
            },
          },

          areaOperativa:
            true,

          sector:
            true,

          ronda:
            true,

          evaluaciones: {
            orderBy: {
              id: 'asc',
            },
          },
        },
      });

    if (!supervision) {
      throw new NotFoundException(
        'La supervisión no existe o no tiene acceso a ella',
      );
    }

    return supervision;
  }

  /*
  * LISTAR SUPERVISIONES
  * DE UN AGENTE SEGÚN ROL
  *
  * ADMIN:
  * ve todas.
  *
  * SUPERVISOR:
  * solamente las realizadas por él.
  */
  async listarPorAgenteParaUsuario(
    agenteSanitarioId: number,
    usuarioId: number,
    rol: RolUsuario,
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

        ...(rol === RolUsuario.SUPERVISOR
          ? {
              supervisorId: usuarioId,
            }
          : {}),
      },

      orderBy: [
        {
          fecha: 'desc',
        },
        {
          id: 'desc',
        },
      ],

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
            numero: true,
            nombre: true,
          },
        },

        ronda: {
          select: {
            id: true,
            externalRondaId: true,
            nombre: true,
          },
        },
      },
    });
  }
  /*
  * LISTAR PARA EXPORTACIÓN
  *
  * No utiliza paginación.
  *
  * ADMIN:
  * exporta todas.
  *
  * SUPERVISOR:
  * exporta solamente las propias.
  */
  async listarParaExportacion(
    usuarioId: number,
    rol: RolUsuario,
  ) {
    return this.prisma.supervision.findMany({
      where:
        rol === RolUsuario.SUPERVISOR
          ? {
              supervisorId: usuarioId,
            }
          : undefined,

      orderBy: [
        {
          fecha: 'desc',
        },
        {
          id: 'desc',
        },
      ],

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
            numero: true,
            nombre: true,
          },
        },

        ronda: {
          select: {
            id: true,
            externalRondaId: true,
            nombre: true,
          },
        },
      },
    });
  }

  /*
   * MÉTRICAS DEL SUPERVISOR
   */
  async obtenerMetricasSupervisor(
    supervisorId: number,
  ) {
    const ahora =
      new Date();

    const inicioMes =
      new Date(
        ahora.getFullYear(),
        ahora.getMonth(),
        1,
      );

    const [
      totalSupervisiones,
      supervisionesMes,
      promedio,
      porClasificacion,
      ultimasSupervisiones,
    ] = await Promise.all([
      this.prisma.supervision.count({
        where: {
          supervisorId,
        },
      }),

      this.prisma.supervision.count({
        where: {
          supervisorId,

          fecha: {
            gte: inicioMes,
          },
        },
      }),

      this.prisma.supervision.aggregate({
        where: {
          supervisorId,
        },

        _avg: {
          promedio: true,
        },
      }),

      this.prisma.supervision.groupBy({
        by: [
          'clasificacion',
        ],

        where: {
          supervisorId,
        },

        _count: {
          _all: true,
        },
      }),

      this.prisma.supervision.findMany({
        where: {
          supervisorId,
        },

        take: 5,

        orderBy: {
          fecha: 'desc',
        },

        include: {
          agenteSanitario: {
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
              numero: true,
              nombre: true,
            },
          },

          ronda: {
            select: {
              id: true,
              externalRondaId:
                true,
              nombre: true,
            },
          },
        },
      }),
    ]);

    return {
      totalSupervisiones,

      supervisionesMes,

      promedioGeneral:
        promedio._avg.promedio
          ? Number(
              promedio
                ._avg
                .promedio,
            )
          : null,

      clasificaciones: {
        CRITICO:
          obtenerCantidadClasificacion(
            porClasificacion,
            Clasificacion.CRITICO,
          ),

        REGULAR:
          obtenerCantidadClasificacion(
            porClasificacion,
            Clasificacion.REGULAR,
          ),

        BUENO:
          obtenerCantidadClasificacion(
            porClasificacion,
            Clasificacion.BUENO,
          ),

        EXCELENTE:
          obtenerCantidadClasificacion(
            porClasificacion,
            Clasificacion.EXCELENTE,
          ),
      },

      ultimasSupervisiones,
    };
  }

  /*
   * MÉTRICAS GLOBALES
   */
  async obtenerMetricasGlobales() {
    const ahora =
      new Date();

    const inicioMes =
      new Date(
        ahora.getFullYear(),
        ahora.getMonth(),
        1,
      );

    const [
      totalAgentes,
      totalAgentesActivos,
      totalSupervisiones,
      supervisionesMes,
      promedio,
      porClasificacion,
      ultimasSupervisiones,
    ] = await Promise.all([
      /*
       * TOTAL DE AGENTES
       */
      this.prisma.agenteSanitario.count(),

      /*
       * TOTAL DE AGENTES ACTIVOS
       */
      this.prisma.agenteSanitario.count({
        where: {
          activo: true,
        },
      }),

      /*
      * TOTAL DE SUPERVISIONES
      */
      this.prisma.supervision.count(),

      /*
      * SUPERVISIONES DEL MES
      */
      this.prisma.supervision.count({
        where: {
          fecha: {
            gte: inicioMes,
          },
        },
      }),

      /*
      * PROMEDIO GENERAL
      */
      this.prisma.supervision.aggregate({
        _avg: {
          promedio: true,
        },
      }),

      /*
      * SUPERVISIONES POR
      * CLASIFICACIÓN
      */
      this.prisma.supervision.groupBy({
        by: [
          'clasificacion',
        ],

        _count: {
          _all: true,
        },
      }),

      /*
      * ÚLTIMAS 5 SUPERVISIONES
      */
      this.prisma.supervision.findMany({
        take: 5,

        orderBy: {
          fecha: 'desc',
        },

        include: {
          agenteSanitario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
            },
          },

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
              numero: true,
              nombre: true,
            },
          },

          ronda: {
            select: {
              id: true,
              externalRondaId: true,
              nombre: true,
            },
          },
        },
      }),
    ]);

    return {
      /*
      * MÉTRICAS DE AGENTES
      */
      totalAgentes,
      totalAgentesActivos,

      /*
      * MÉTRICAS DE SUPERVISIONES
      */
      totalSupervisiones,

      supervisionesMes,

      promedioGeneral:
        promedio._avg.promedio
          ? Number(
              promedio
                ._avg
                .promedio,
            )
          : null,

      clasificaciones: {
        CRITICO:
          obtenerCantidadClasificacion(
            porClasificacion,
            Clasificacion.CRITICO,
          ),

        REGULAR:
          obtenerCantidadClasificacion(
            porClasificacion,
            Clasificacion.REGULAR,
          ),

        BUENO:
          obtenerCantidadClasificacion(
            porClasificacion,
            Clasificacion.BUENO,
          ),

        EXCELENTE:
          obtenerCantidadClasificacion(
            porClasificacion,
            Clasificacion.EXCELENTE,
          ),
      },

      ultimasSupervisiones,
    };
  }
}

function obtenerCantidadClasificacion(
  datos: {
    clasificacion:
      Clasificacion | null;

    _count: {
      _all: number;
    };
  }[],
  clasificacion:
    Clasificacion,
): number {
  return (
    datos.find(
      item =>
        item.clasificacion ===
        clasificacion,
    )?._count._all ?? 0
  );
}