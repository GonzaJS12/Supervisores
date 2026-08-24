import { IsInt, Max, Min } from 'class-validator';

export class CrearEvaluacionCriterioDto {
  @IsInt()
  @Min(1)
  criterioId: number;

  @IsInt()
  @Min(1)
  @Max(5)
  puntuacion: number;
}