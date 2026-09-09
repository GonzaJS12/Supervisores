import { Module } from '@nestjs/common';

import { RondasController } from './rondas.controller';
import { RondasService } from './rondas.service';

@Module({
  controllers: [RondasController],
  providers: [RondasService],
})
export class RondasModule {}