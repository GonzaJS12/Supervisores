import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

import {
  Type,
} from 'class-transformer';

export class ModificarUsuarioDto {
  @IsString()
  @MinLength(1)
  nombre: string;

  @IsString()
  @MinLength(1)
  apellido: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  areaOperativaId?: number;
}