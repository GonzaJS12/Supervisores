import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { RolUsuario } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CriteriosEvaluacionService } from './criterios-evaluacion.service';
import { CrearCriterioDto } from './dto/crear-criterio.dto';
import { ActualizarCriterioDto } from './dto/actualizar-criterio.dto';

@Controller('criterios-evaluacion')
@UseGuards(JwtAuthGuard)
export class CriteriosEvaluacionController {
  constructor(
    private readonly service: CriteriosEvaluacionService,
  ) {}

  @Get()
  listar() {
    return this.service.listar();
  }

  @Get('bloque/:bloqueId')
  listarPorBloque(
    @Param('bloqueId', ParseIntPipe)
    bloqueId: number,
  ) {
    return this.service.listarPorBloque(bloqueId);
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
    @Body() dto: CrearCriterioDto,
  ) {
    return this.service.crear(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ADMIN)
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarCriterioDto,
  ) {
    return this.service.actualizar(id, dto);
  }
}