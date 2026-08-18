import {Body, Controller, Get, Post, UseGuards} from '@nestjs/common';
import { RolUsuario } from '@prisma/client';
import { AreasService } from './areas.service';
import { CrearAreaDto } from './dto/crear-area.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('areas')
@UseGuards(JwtAuthGuard)
export class AreasController {
  constructor(
    private readonly areasService: AreasService,
  ) {}

  @Get()
  listar() {
    return this.areasService.listar();
  }

  @Post()
  @Roles(RolUsuario.ADMIN)
  @UseGuards(RolesGuard)
  crear(@Body() dto: CrearAreaDto) {
    return this.areasService.crear(dto);
  }
}