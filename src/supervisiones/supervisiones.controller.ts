import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import {
  RolUsuario,
} from '@prisma/client';

import {
  SupervisionesService,
} from './supervisiones.service';

import {
  CrearSupervisionDto,
} from './dto/crear-supervision.dto';

import {
  JwtAuthGuard,
} from '../auth/guards/jwt-auth.guard';

import {
  RolesGuard,
} from '../auth/guards/roles.guard';

import {
  Roles,
} from '../auth/decorators/roles.decorator';

type UsuarioAutenticado = {
  id: number;
  rol: RolUsuario;
};

@Controller('supervisiones')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
export class SupervisionesController {
  constructor(
    private readonly supervisionesService:
      SupervisionesService,
  ) {}

  /*
   * CREAR SUPERVISIÓN
   *
   * ADMIN y SUPERVISOR
   * pueden crear supervisiones.
   */
  @Post()
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.SUPERVISOR,
  )
  crear(
    @Body()
    dto: CrearSupervisionDto,

    @Req()
    req: Request,
  ) {
    const usuario =
      req.user as UsuarioAutenticado;

    return this.supervisionesService.crear(
      dto,
      usuario.id,
    );
  }

  /*
   * SUPERVISOR
   *
   * Devuelve solamente las
   * supervisiones realizadas
   * por el supervisor autenticado.
   *
   * Permite filtrar por:
   * - fecha desde
   * - fecha hasta
   * - clasificación
   *
   * Los filtros pueden combinarse.
   */
  @Get('mis-supervisiones')
  @Roles(
    RolUsuario.SUPERVISOR,
  )
  listarMisSupervisiones(
    @Req()
    req: Request,

    @Query('page')
    page?: string,

    @Query('limit')
    limit?: string,

    @Query('fechaDesde')
    fechaDesde?: string,

    @Query('fechaHasta')
    fechaHasta?: string,

    @Query('clasificacion')
    clasificacion?: string,
  ) {
    const usuario =
      req.user as UsuarioAutenticado;

    return this.supervisionesService
      .listarPorSupervisor(
        usuario.id,

        page
          ? Number(page)
          : 1,

        limit
          ? Number(limit)
          : 15,

        fechaDesde,
        fechaHasta,
        clasificacion,
      );
  }

  /*
   * SUPERVISOR
   *
   * Métricas personales.
   */
  @Get('mis-metricas')
  @Roles(
    RolUsuario.SUPERVISOR,
  )
  obtenerMisMetricas(
    @Req()
    req: Request,
  ) {
    const usuario =
      req.user as UsuarioAutenticado;

    return this.supervisionesService
      .obtenerMetricasSupervisor(
        usuario.id,
      );
  }

  /*
   * ADMIN
   *
   * Métricas globales.
   */
  @Get('metricas')
  @Roles(
    RolUsuario.ADMIN,
  )
  obtenerMetricasGlobales() {
    return this.supervisionesService
      .obtenerMetricasGlobales();
  }

  /*
   * ADMIN
   *
   * Devuelve todas las
   * supervisiones.
   *
   * Permite filtrar por:
   * - fecha desde
   * - fecha hasta
   * - clasificación
   *
   * Los filtros pueden combinarse.
   */
  @Get()
  @Roles(
    RolUsuario.ADMIN,
  )
  listar(
    @Query('page')
    page?: string,

    @Query('limit')
    limit?: string,

    @Query('fechaDesde')
    fechaDesde?: string,

    @Query('fechaHasta')
    fechaHasta?: string,

    @Query('clasificacion')
    clasificacion?: string,
  ) {
    return this.supervisionesService
      .listar(
        page
          ? Number(page)
          : 1,

        limit
          ? Number(limit)
          : 15,

        fechaDesde,
        fechaHasta,
        clasificacion,
      );
  }

  /*
   * ADMIN y SUPERVISOR
   *
   * Historial de supervisiones
   * de un agente.
   *
   * El service aplica las
   * restricciones correspondientes
   * según el rol.
   */
  @Get('agente/:agenteId')
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.SUPERVISOR,
  )
  listarPorAgente(
    @Param(
      'agenteId',
      ParseIntPipe,
    )
    agenteId: number,

    @Req()
    req: Request,
  ) {
    const usuario =
      req.user as UsuarioAutenticado;

    return this.supervisionesService
      .listarPorAgenteParaUsuario(
        agenteId,
        usuario.id,
        usuario.rol,
      );
  }

  /*
   * EXPORTACIÓN
   *
   * ADMIN:
   * obtiene todas las supervisiones.
   *
   * SUPERVISOR:
   * obtiene solamente las propias.
   *
   * Este endpoint NO está paginado
   * porque se utiliza para generar
   * el reporte PDF completo.
   */
  @Get('exportacion')
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.SUPERVISOR,
  )
  listarParaExportacion(
    @Req()
    req: Request,
  ) {
    const usuario =
      req.user as UsuarioAutenticado;

    return this.supervisionesService
      .listarParaExportacion(
        usuario.id,
        usuario.rol,
      );
  }

  /*
   * BUSCAR POR ID
   *
   * ADMIN:
   * puede ver cualquiera.
   *
   * SUPERVISOR:
   * solamente una supervisión
   * realizada por él.
   */
  @Get(':id')
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.SUPERVISOR,
  )
  buscarPorId(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Req()
    req: Request,
  ) {
    const usuario =
      req.user as UsuarioAutenticado;

    return this.supervisionesService
      .buscarPorIdParaUsuario(
        id,
        usuario.id,
        usuario.rol,
      );
  }
}