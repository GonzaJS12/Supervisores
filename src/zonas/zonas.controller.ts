import { Controller, Get, UseGuards } from '@nestjs/common';
import { ZonasService } from './zonas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('zonas')
@UseGuards(JwtAuthGuard)
export class ZonasController {
  constructor(
    private readonly zonasService: ZonasService,
  ) {}

  @Get()
  listar() {
    return this.zonasService.listar();
  }
}