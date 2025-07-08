import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
constructor(private authService: AuthService) {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set. Application cannot start.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }


  async validate(payload: { sub: string; email: string }) {
    const user = await this.authService.validateUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    const userWithRoles = { ...user, roles: user.roles.map(userRole => userRole.role.name) };
    const { passwordHash, ...result } = userWithRoles;
    return result;
  }
}
