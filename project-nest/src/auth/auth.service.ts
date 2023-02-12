import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * emailOrNickname을 통해
   * UsersService에서 사용자의 정보를 가져와
   * password가 맞는지 확인
   * @param emailOrNickname 이메일 또는 닉네임
   * @param password 비밀번호
   */
  async validateUser(
    emailOrNickname: string,
    plainPassword: string,
  ): Promise<any> {
    console.log(`[auth.service.ts] validateUser()`);

    const user = await this.usersService.findOneByUserEmailOrNickname(
      emailOrNickname,
    );
    if (user && (await user.comparePassword(plainPassword))) {
      const { password, ...result } = user;
      return result;
    } else {
      return null;
    }
  }

  /**
   * access token 발급 받기
   * @param id 사용자 아이디
   * @returns 생성된 access token과 cookie 정보 반환
   */
  genCookieWithJwtAccessToken(id: string) {
    const payload = { id };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET_ACCESS_TOKEN'),
      // expiresIn: `${this.configService.get('JWT_EXPIRATION_ACCESS_TOKEN')}s`,
      expiresIn: this.configService.get('JWT_EXPIRATION_ACCESS_TOKEN'),
    });

    return {
      accessToken,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      maxAge: Number(this.configService.get('JWT_EXPIRATION_ACCESS_TOKEN')),
    };
  }
  /**
   * refresh token 발급 받기
   * @param id 사용자 아이디
   * @returns 생성된 refresh token과 cookie 정보 반환
   */
  genCookieWithJwtRefreshToken(id: string) {
    const payload = { id };
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET_REFRESH_TOKEN'),
      expiresIn: this.configService.get('JWT_EXPIRATION_REFRESH_TOKEN'),
    });

    return {
      refreshToken,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      maxAge: Number(this.configService.get(`JWT_EXPIRATION_REFRESH_TOKEN`)),
    };
  }

  genCookieForLogout() {
    console.log(`[auth.service.ts] getCookieForLogout()`);
    return {
      accessOption: {
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        maxAge: 0,
      },
      refreshOption: {
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        maxAge: 0,
      },
    };
  }
}
