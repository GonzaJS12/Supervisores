import {
  IsBoolean,
} from 'class-validator';

export class CambiarEstadoAgenteDto {
  @IsBoolean()
  activo: boolean;
}