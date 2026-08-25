import { IsInt, IsNotEmpty, IsOptional, IsString,Min} from 'class-validator';

export class CrearBloqueDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsInt()
  @Min(1)
  orden: number;
}