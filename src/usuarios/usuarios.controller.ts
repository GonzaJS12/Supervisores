import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { RolUsuario } from '@prisma/client';
import { UsuariosService } from './usuarios.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { CambiarPasswordDto } from './dto/cambiar-password.dto';
import { CambiarRolDto } from './dto/cambiar-rol.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuariosController {
  constructor(
    private readonly usuariosService:
      UsuariosService,
  ) {}

  @Get()
  @Roles(RolUsuario.ADMIN)
  listar() {
    return this.usuariosService.listar();
  }

  @Get(':id')
  @Roles(RolUsuario.ADMIN)
  buscarPorId(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.usuariosService.buscarPorId(
      id,
    );
  }

  @Post()
  @Roles(RolUsuario.ADMIN)
  crear(
    @Body()
    dto: CrearUsuarioDto,
  ) {
    return this.usuariosService.crear(
      dto,
    );
  }

  @Patch(':id/password')
  @Roles(RolUsuario.ADMIN)
  cambiarPassword(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    dto: CambiarPasswordDto,
  ) {
    return this.usuariosService.cambiarPassword(
      id,
      dto.password,
    );
  }

  @Patch(':id/estado')
  @Roles(RolUsuario.ADMIN)
  cambiarEstado(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    body: {
      activo: boolean;
    },
  ) {
    return this.usuariosService.cambiarEstado(
      id,
      body.activo,
    );
  }

  @Patch(':id/rol')
  @Roles(RolUsuario.ADMIN)
  cambiarRol(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    dto: CambiarRolDto,

    @Req()
    request: {
      user: {
        id: number;
      };
    },
  ) {
    return this.usuariosService.cambiarRol(
      id,
      dto.rol,
      request.user.id,
    );
  }
}