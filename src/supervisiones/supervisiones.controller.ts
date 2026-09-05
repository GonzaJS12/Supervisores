import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
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

  @Post()
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.SUPERVISOR,
  )
  crear(
    @Body() dto: CrearSupervisionDto,
    @Req() req: Request,
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
   * Devuelve solamente sus supervisiones.
   */
  @Get('mis-supervisiones')
  @Roles(RolUsuario.SUPERVISOR)
  listarMisSupervisiones(
    @Req() req: Request,
  ) {
    const usuario =
      req.user as UsuarioAutenticado;

    return this.supervisionesService
      .listarPorSupervisor(
        usuario.id,
      );
  }

  /*
   * SUPERVISOR
   * Métricas personales.
   */
  @Get('mis-metricas')
  @Roles(RolUsuario.SUPERVISOR)
  obtenerMisMetricas(
    @Req() req: Request,
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
   * Métricas globales.
   */
  @Get('metricas')
  @Roles(RolUsuario.ADMIN)
  obtenerMetricasGlobales() {
    return this.supervisionesService
      .obtenerMetricasGlobales();
  }

  /*
   * ADMIN
   * Todas las supervisiones.
   */
  @Get()
  @Roles(RolUsuario.ADMIN)
  listar() {
    return this.supervisionesService.listar();
  }

  /*
   * ADMIN
   * Historial completo de un agente.
   */
  @Get('agente/:agenteId')
  @Roles(RolUsuario.ADMIN)
  listarPorAgente(
    @Param(
      'agenteId',
      ParseIntPipe,
    )
    agenteId: number,
  ) {
    return this.supervisionesService
      .listarPorAgente(
        agenteId,
      );
  }

  /*
   * ADMIN:
   * puede ver cualquiera.
   *
   * SUPERVISOR:
   * solamente una realizada por él.
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

    @Req() req: Request,
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