import {IsEmail, IsNotEmpty, IsOptional, IsString, IsInt, Min} from 'class-validator';

export class CrearAgenteDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  apellido: string;

  @IsOptional()
  @IsString()
  documento?: string;

  @IsOptional()
  @IsString()
  legajo?: string;

  @IsInt()
  @Min(1)
  areaOperativaId: number;
}