import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards} from '@nestjs/common';
import { RolUsuario } from '@prisma/client';
import { AgentesService } from './agentes.service';
import { CrearAgenteDto } from './dto/crear-agente.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('agentes')
@UseGuards(JwtAuthGuard)
export class AgentesController {
  constructor(
    private readonly agentesService: AgentesService,
  ) {}

  @Get()
  listar() {
    return this.agentesService.listar();
  }

  @Get('area/:areaOperativaId')
  listarPorArea(
    @Param('areaOperativaId', ParseIntPipe)
    areaOperativaId: number,
  ) {
    return this.agentesService.listarPorArea(
      areaOperativaId,
    );
  }

  @Get(':id')
  buscarPorId(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.agentesService.buscarPorId(id);
  }

  @Post()
  @Roles(RolUsuario.ADMIN, RolUsuario.SUPERVISOR)
  @UseGuards(RolesGuard)
  crear(@Body() dto: CrearAgenteDto) {
    return this.agentesService.crear(dto);
  }
}