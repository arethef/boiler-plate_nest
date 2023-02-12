import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      // Request에서 jwt를 추출하는 방법 설정
      // -> Authorization에서 Bearer Token에 jwt 토큰을 담아 전송해야한다.
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          return request?.cookies?.Authentication;
        },
      ]),
      // true로 설정하면 Passport에 토큰 검증을 위임하지 않고 직접 검증
      // false는 Passport에 검증 위임
      ignoreExpiration: false,
      // 검증 비밀 값 (유출 주의)
      secretOrKey: configService.get('JWT_SECRET_ACCESS_TOKEN'),
    });
  }

  async validate(payload: any) {
    console.log(`[jwt.strategy.ts] validate()`);
    console.log(`payload`, payload);
    const user: User | void = await this.usersService.findOneByUserId(
      payload.id,
    );
    return user;
  }
}
