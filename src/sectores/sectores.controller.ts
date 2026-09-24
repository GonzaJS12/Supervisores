import { Controller, Get, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { SectoresService } from './sectores.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolUsuario } from '@prisma/client';

interface UsuarioAutenticado {
  id: number;
  rol: RolUsuario;
}

interface RequestConUsuario extends Request {
  user: UsuarioAutenticado;
}

@Controller('sectores')
@UseGuards(JwtAuthGuard)
export class SectoresController {
  constructor(
    private readonly sectoresService: SectoresService,
  ) {}

  @Get()
  listar(
    @Req() req: RequestConUsuario,
  ) {
    return this.sectoresService.listarParaUsuario(
      req.user.id,
      req.user.rol,
    );
  }

  @Get('area/:areaOperativaId')
  listarPorArea(
    @Param(
      'areaOperativaId',
      ParseIntPipe,
    )
    areaOperativaId: number,

    @Req()
    req: RequestConUsuario,
  ) {
    return this.sectoresService.listarPorAreaParaUsuario(
      areaOperativaId,
      req.user.id,
      req.user.rol,
    );
  }
}