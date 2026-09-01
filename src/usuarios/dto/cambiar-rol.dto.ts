import { IsEnum } from 'class-validator';

import { RolUsuario } from '@prisma/client';

export class CambiarRolDto {
    @IsEnum(RolUsuario, {
        message:
        'El rol debe ser ADMIN o SUPERVISOR',
    })
    rol: RolUsuario;
}