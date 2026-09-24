import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategies';

const jwtSecret =
  process.env.JWT_SECRET?.trim();

if (!jwtSecret) {
  throw new Error(
    'JWT_SECRET no está configurado',
  );
}

@Module({
  imports: [
    JwtModule.register({
      secret: jwtSecret,

      signOptions: {
        expiresIn: '8h',
      },
    }),
  ],

  controllers: [
    AuthController,
  ],

  providers: [
    AuthService,
    JwtStrategy,
  ],

  exports: [
    AuthService,
    JwtModule,
  ],
})
export class AuthModule {}