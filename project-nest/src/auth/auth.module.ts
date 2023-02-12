import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { User } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/users.module';
// import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

@Module({
  // imports: [TypeOrmModule.forFeature([User])],
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET_ACCESS_TOKEN'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION_ACCESS_TOKEN'),
        },
      }),
    }),
  ],
  // providers: [AuthService, UsersService],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtRefreshStrategy],
  exports: [JwtModule],
  // exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
