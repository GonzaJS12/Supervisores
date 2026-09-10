import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  RolUsuario,
} from '@prisma/client';

import type {
  Request,
} from 'express';

import {
  AgentesService,
} from './agentes.service';

import {
  JwtAuthGuard,
} from '../auth/guards/jwt-auth.guard';

type UsuarioAutenticado = {
  id: number;
  rol: RolUsuario;
};

@Controller('agentes')
@UseGuards(JwtAuthGuard)
export class AgentesController {
  constructor(
    private readonly agentesService:
      AgentesService,
  ) {}

  /*
   * LISTADO PRINCIPAL PAGINADO
   *
   * ADMIN:
   * devuelve todos los agentes.
   *
   * SUPERVISOR:
   * devuelve solamente los agentes
   * de su área operativa asignada.
   *
   * Máximo 15 registros por página.
   */
  @Get()
  listar(
    @Req() req: Request,

    @Query('page')
    page?: string,

    @Query('limit')
    limit?: string,
  ) {
    const usuario =
      req.user as UsuarioAutenticado;

    return this.agentesService
      .listarParaUsuario(
        usuario.id,
        usuario.rol,
        Number(page) || 1,
        Number(limit) || 15,
      );
  }

  /*
   * ADMIN:
   * puede consultar cualquier área.
   *
   * SUPERVISOR:
   * solamente puede consultar
   * su propia área operativa.
   *
   * Este endpoint NO se pagina
   * porque también se utiliza para
   * selectores de otros formularios.
   */
  @Get('area/:areaOperativaId')
  listarPorArea(
    @Param(
      'areaOperativaId',
      ParseIntPipe,
    )
    areaOperativaId: number,

    @Req() req: Request,
  ) {
    const usuario =
      req.user as UsuarioAutenticado;

    return this.agentesService
      .listarPorAreaParaUsuario(
        areaOperativaId,
        usuario.id,
        usuario.rol,
      );
  }

  /*
   * ADMIN:
   * puede consultar cualquier agente.
   *
   * SUPERVISOR:
   * solamente agentes pertenecientes
   * a su área operativa.
   */
  @Get(':id')
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

    return this.agentesService
      .buscarPorIdParaUsuario(
        id,
        usuario.id,
        usuario.rol,
      );
  }
}