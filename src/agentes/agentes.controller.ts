import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  RolUsuario,
} from '@prisma/client';

import {
  AgentesService,
} from './agentes.service';

import {
  CrearAgenteDto,
} from './dto/crear-agente.dto';

import {
  ActualizarAgenteDto,
} from './dto/actualizar-agente.dto';

import {
  CambiarEstadoAgenteDto,
} from './dto/cambiar-estado-agente.dto';

import {
  JwtAuthGuard,
} from '../auth/guards/jwt-auth.guard';

import {
  RolesGuard,
} from '../auth/guards/roles.guard';

import {
  Roles,
} from '../auth/decorators/roles.decorator';

@Controller('agentes')
@UseGuards(JwtAuthGuard)
export class AgentesController {
  constructor(
    private readonly agentesService:
      AgentesService,
  ) {}

  /*
   * LISTAR TODOS
   *
   * Incluye activos e inactivos.
   */
  @Get()
  listar() {
    return this.agentesService.listar();
  }

  /*
   * LISTAR POR ÁREA
   *
   * Se mantiene solamente con
   * agentes activos porque este
   * endpoint puede utilizarse
   * para seleccionar agentes.
   */
  @Get('area/:areaOperativaId')
  listarPorArea(
    @Param(
      'areaOperativaId',
      ParseIntPipe,
    )
    areaOperativaId: number,
  ) {
    return this.agentesService.listarPorArea(
      areaOperativaId,
    );
  }

  /*
   * BUSCAR AGENTE
   */
  @Get(':id')
  buscarPorId(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.agentesService.buscarPorId(
      id,
    );
  }

  /*
   * CREAR AGENTE
   */
  @Post()
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.SUPERVISOR,
  )
  @UseGuards(RolesGuard)
  crear(
    @Body()
    dto: CrearAgenteDto,
  ) {
    return this.agentesService.crear(
      dto,
    );
  }

  /*
   * CAMBIAR ESTADO
   *
   * IMPORTANTE:
   * esta ruta tiene que estar
   * antes de PATCH :id.
   */
  @Patch(':id/estado')
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.SUPERVISOR,
  )
  @UseGuards(RolesGuard)
  cambiarEstado(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    dto: CambiarEstadoAgenteDto,
  ) {
    return this.agentesService.cambiarEstado(
      id,
      dto.activo,
    );
  }

  /*
   * MODIFICAR DATOS
   */
  @Patch(':id')
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.SUPERVISOR,
  )
  @UseGuards(RolesGuard)
  actualizar(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    dto: ActualizarAgenteDto,
  ) {
    return this.agentesService.actualizar(
      id,
      dto,
    );
  }
}