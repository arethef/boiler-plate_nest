import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'emailOrNickname',
    });
  }

  /**
   * 사용자가 존재하고 유효한지 확인
   * @param emailOrNickname 입력으로 들어온 이메일 또는 닉네임
   * @param password 입력으로 들어온 비밀번호
   * @returns User 엔티티에서 비밀번호 제외한 나머지 부분
   */
  async validate(emailOrNickname: string, password: string): Promise<any> {
    const result = await this.authService.validateUser(
      emailOrNickname,
      password,
    );
    if (result) {
      return result;
    } else {
      throw new UnauthorizedException(
        'LocalStrategy에서 사용자 인증에 문제가 생겼다.',
      );
    }
  }
}
