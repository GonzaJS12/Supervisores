import { Controller, Get, Param, ParseIntPipe, UseGuards} from '@nestjs/common';
import { AgentesService } from './agentes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('agentes')
@UseGuards(JwtAuthGuard)
export class AgentesController {
  constructor(
    private readonly agentesService: AgentesService,
  ) {}

  /*
   * LISTAR TODOS
   *
   * Incluye activos e inactivos.
   */
  @Get()
  listar() {
    return this.agentesService.listar();
  }

  /*
   * LISTAR POR ÁREA
   *
   * Solamente devuelve agentes activos.
   * Se utiliza principalmente para
   * seleccionar agentes al crear
   * una supervisión.
   */
  @Get('area/:areaOperativaId')
  listarPorArea(
    @Param('areaOperativaId', ParseIntPipe)
    areaOperativaId: number,
  ) {
    return this.agentesService.listarPorArea(
      areaOperativaId,
    );
  }

  /*
   * BUSCAR AGENTE POR ID LOCAL
   */
  @Get(':id')
  buscarPorId(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.agentesService.buscarPorId(id);
  }
}