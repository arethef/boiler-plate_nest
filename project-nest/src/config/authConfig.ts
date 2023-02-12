import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwt: {
    secret: {
      accessToken: process.env.JWT_SECRET_ACCESS_TOKEN,
      refreshToken: process.env.JWT_SECRET_REFRESH_TOKEN,
    },
    expiresIn: {
      accessToken: process.env.JWT_EXPIRATION_ACCESS_TOKEN,
      refreshToken: process.env.JWT_EXPIRATION_REFRESH_TOKEN,
    },
    audience: process.env.JWT_AUDIENCE,
    issuer: process.env.JWT_ISSUER,
  },
}));
