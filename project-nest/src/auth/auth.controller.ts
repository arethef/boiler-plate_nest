import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { Public } from './decorators/public-auth.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refersh.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req, @Res({ passthrough: true }) res: Response) {
    console.log(`[auth.controller.ts] login()`);
    console.log(`req.user`, req.user);
    const user = req.user;
    const { accessToken, ...accessOption } =
      this.authService.genCookieWithJwtAccessToken(user.id);
    const { refreshToken, ...refreshOption } =
      this.authService.genCookieWithJwtRefreshToken(user.id);
    await this.usersService.saveRefreshTokenWithUserId(user.id, refreshToken);
    res.cookie('Authentication', accessToken, accessOption);
    res.cookie('Refresh', refreshToken, refreshOption);
    return user;
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('logout')
  async logout(@Req() req, @Res({ passthrough: true }) res: Response) {
    console.log(`[auth.controller.ts] logout()`);
    console.log(req.user);

    const user = req.user;
    const { accessOption, refreshOption } =
      this.authService.genCookieForLogout();
    await this.usersService.removeRefreshTokenById(user.id);
    res.cookie('Authentication', '', accessOption);
    res.cookie('Refresh', '', refreshOption);
    console.log(`res:`, res);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  refresh(@Req() req, @Res({ passthrough: true }) res: Response) {
    const user = req.user;
    const { accessToken, ...accessOption } =
      this.authService.genCookieWithJwtAccessToken(user.id);
    res.cookie('Authentication', accessToken, accessOption);
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('test-profile')
  getProfile(@Req() req: Request) {
    console.log(`[auth.controller.ts] getProfile()`);

    return req.user;
  }
}
