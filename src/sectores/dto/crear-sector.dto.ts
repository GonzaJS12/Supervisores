import { IsInt, IsNotEmpty, IsOptional, IsString, Min} from 'class-validator';

export class CrearSectorDto {
  @IsInt()
  @Min(1)
  numero: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nombre?: string;

  @IsInt()
  @Min(1)
  areaOperativaId: number;
}