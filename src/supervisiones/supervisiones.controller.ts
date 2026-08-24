import {  Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards} from '@nestjs/common';
import type { Request } from 'express';
import { SupervisionesService } from './supervisiones.service';
import { CrearSupervisionDto } from './dto/crear-supervision.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('supervisiones')
@UseGuards(JwtAuthGuard)
export class SupervisionesController {
  constructor(
    private readonly supervisionesService: SupervisionesService,
  ) {}

  @Post()
  crear(
    @Body() dto: CrearSupervisionDto,
    @Req() req: Request,
  ) {
    const usuario = req.user as {
      id: number;
    };

    return this.supervisionesService.crear(
      dto,
      usuario.id,
    );
  }
  @Get()
  istar() {
    return this.supervisionesService.listar();
  }

  @Get('agente/:agenteId')
  listarPorAgente(
    @Param('agenteId', ParseIntPipe) agenteId: number,
  ) {
    return this.supervisionesService.listarPorAgente(
      agenteId,
    );
  }

  @Get(':id')
  buscarPorId(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.supervisionesService.buscarPorId(id);
  }
}