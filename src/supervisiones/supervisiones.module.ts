import { Module } from '@nestjs/common';
import { SupervisionesController } from './supervisiones.controller';
import { SupervisionesService } from './supervisiones.service';

@Module({
  controllers: [SupervisionesController],
  providers: [SupervisionesService],
})
export class SupervisionesModule {}