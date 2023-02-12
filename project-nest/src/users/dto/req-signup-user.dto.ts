export class ReqSignupUserDto {
  readonly email: string;
  readonly password: string;
  readonly nickname: string;
  readonly position: string;
  readonly businessName?: string;
  readonly brn?: string;
  readonly imageId?: string;
  readonly signupVerifyToken?: string;
  readonly refreshToken?: string;
}
