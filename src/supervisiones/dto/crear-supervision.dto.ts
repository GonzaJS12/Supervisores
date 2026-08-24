import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

import { Type } from 'class-transformer';
import { DecisionGestion } from '@prisma/client';

import { CrearEvaluacionCriterioDto } from './crear-evaluacion-criterio.dto';

export class CrearSupervisionDto {
  @IsInt()
  @Min(1)
  agenteSanitarioId: number;

  @IsInt()
  @Min(1)
  areaOperativaId: number;

  @IsInt()
  @Min(1)
  sectorId: number;

  @IsDateString()
  fecha: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  familiaNumero?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  rondaNumero?: number;

  @IsEnum(DecisionGestion)
  decisionGestion: DecisionGestion;

  @IsOptional()
  @IsString()
  fortalezas?: string;

  @IsOptional()
  @IsString()
  oportunidadesMejora?: string;

  @IsOptional()
  @IsString()
  situacionesCriticas?: string;

  @IsOptional()
  @IsString()
  recomendaciones?: string;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CrearEvaluacionCriterioDto)
  evaluaciones: CrearEvaluacionCriterioDto[];
}