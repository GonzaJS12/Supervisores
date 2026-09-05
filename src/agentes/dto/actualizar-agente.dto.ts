import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class ActualizarAgenteDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nombre?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  apellido?: string;

  @IsOptional()
  @IsString()
  documento?: string;

  @IsOptional()
  @IsString()
  legajo?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  areaOperativaId?: number;
}