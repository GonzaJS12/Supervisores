import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { SectoresService } from './sectores.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
}