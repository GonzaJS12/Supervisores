import { Module } from '@nestjs/common';
import { CriteriosEvaluacionController } from './criterios-evaluacion.controller';
import { CriteriosEvaluacionService } from './criterios-evaluacion.service';

@Module({
  controllers: [CriteriosEvaluacionController],
  providers: [CriteriosEvaluacionService],
})
export class CriteriosEvaluacionModule {}