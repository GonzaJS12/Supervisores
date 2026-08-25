import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ActualizarCriterioDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  bloqueId?: number;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  orden?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}