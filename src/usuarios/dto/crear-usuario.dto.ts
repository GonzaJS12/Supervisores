import { IsEmail,IsEnum,IsNotEmpty,IsString,MinLength} from 'class-validator';
import { RolUsuario } from '@prisma/client';

export class CrearUsuarioDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  apellido: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(RolUsuario)
  rol: RolUsuario;
}