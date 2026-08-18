import {Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards} from '@nestjs/common';
import { RolUsuario } from '@prisma/client';
import { SectoresService } from './sectores.service';
import { CrearSectorDto } from './dto/crear-sector.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('sectores')
@UseGuards(JwtAuthGuard)
export class SectoresController {
  constructor(
    private readonly sectoresService: SectoresService,
  ) {}

  @Get()
  listar() {
    return this.sectoresService.listar();
  }

  @Get('area/:areaOperativaId')
  listarPorArea(
    @Param('areaOperativaId', ParseIntPipe)
    areaOperativaId: number,
  ) {
    return this.sectoresService.listarPorArea(
      areaOperativaId,
    );
  }

  @Post()
  @Roles(RolUsuario.ADMIN)
  @UseGuards(RolesGuard)
  crear(@Body() dto: CrearSectorDto) {
    return this.sectoresService.crear(dto);
  }
}