import { IsNotEmpty, IsOptional, IsString} from 'class-validator';

export class CrearAreaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}