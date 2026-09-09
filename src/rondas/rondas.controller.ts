import { Controller, Get, UseGuards} from '@nestjs/common';
import { RondasService } from './rondas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('rondas')
@UseGuards(JwtAuthGuard)
export class RondasController {
  constructor(
    private readonly rondasService: RondasService,
  ) {}

  @Get()
  listar() {
    return this.rondasService.listar();
  }
}