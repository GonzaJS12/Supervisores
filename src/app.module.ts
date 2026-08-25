import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { AreasModule } from './areas/areas.module';
import { SectoresModule } from './sectores/sectores.module';
import { AgentesModule } from './agentes/agentes.module';
import { SupervisionesModule } from './supervisiones/supervisiones.module';
import { BloquesEvaluacionModule } from './bloques-evaluacion/bloques-evaluacion.module';
import { CriteriosEvaluacionModule } from './criterios-evaluacion/criterios-evaluacion.module';

@Module({
  imports: [PrismaModule, UsuariosModule, AuthModule, AreasModule, SectoresModule, AgentesModule, SupervisionesModule, BloquesEvaluacionModule,CriteriosEvaluacionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
