import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          return request?.cookies?.Refresh;
        },
      ]),
      secretOrKey: configService.get('JWT_SECRET_REFRESH_TOKEN'),
      passReqToCallback: true,
    });
  }

  async validate(req, payload: any) {
    console.log(`[jwt-refresh.strategy.ts] validate()`);
    console.log(`req.cookies:`, req.cookies, `, payload:`, payload);

    const refreshToken = req.cookies?.Refresh;
    return this.usersService.findUserByIdAndRefreshToken(
      payload.id,
      refreshToken,
    );
  }
}
