import { Module } from '@nestjs/common';
import { BloquesEvaluacionController } from './bloques-evaluacion.controller';
import { BloquesEvaluacionService } from './bloques-evaluacion.service';

@Module({
    controllers: [BloquesEvaluacionController],
    providers: [BloquesEvaluacionService],
})

export class BloquesEvaluacionModule {}