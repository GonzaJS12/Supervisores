import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { RolUsuario } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BloquesEvaluacionService } from './bloques-evaluacion.service';
import { CrearBloqueDto } from './dto/crear-bloque.dto';
import { ActualizarBloqueDto } from './dto/actualizar-bloque.dto';

@Controller('bloques-evaluacion')
@UseGuards(JwtAuthGuard)
export class BloquesEvaluacionController {
  constructor(
    private readonly service: BloquesEvaluacionService,
  ) {}

  @Get()
  listar() {
    return this.service.listar();
  }

  @Get(':id')
  buscarPorId(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.buscarPorId(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ADMIN)
  crear(
    @Body() dto: CrearBloqueDto,
  ) {
    return this.service.crear(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ADMIN)
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarBloqueDto,
  ) {
    return this.service.actualizar(id, dto);
  }
}