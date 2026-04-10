import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Request,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { AppSettingsService } from '../app-settings/app-settings.service';
import { SUPPORTED_LOCALES_PUBLIC } from '../locale/supported-locales';
import { UpdateDefaultLocaleDto } from './dto/update-default-locale.dto';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly appSettingsService: AppSettingsService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  /** Public: organization default + supported languages for the UI. */
  @Get('locale')
  async getLocalePublic() {
    const settings = await this.appSettingsService.getOrCreate();
    return {
      defaultLocale: settings.defaultLocale,
      supportedLocales: SUPPORTED_LOCALES_PUBLIC,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('locale/default')
  @HttpCode(HttpStatus.OK)
  async setDefaultLocale(@Body() dto: UpdateDefaultLocaleDto) {
    await this.appSettingsService.setDefaultLocale(dto.defaultLocale);
    const settings = await this.appSettingsService.getOrCreate();
    return {
      defaultLocale: settings.defaultLocale,
      supportedLocales: SUPPORTED_LOCALES_PUBLIC,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @HttpCode(HttpStatus.OK)
  async patchMe(@Request() req, @Body() dto: UpdateMyProfileDto) {
    const userId = req.user.id as string;
    if (dto.preferredLocale === undefined) {
      const user = await this.usersService.findOneById(userId);
      return this.toPublicUser(user);
    }
    await this.usersService.update(userId, {
      preferredLocale: dto.preferredLocale,
    });
    const user = await this.usersService.findOneById(userId);
    return this.toPublicUser(user);
  }

  private toPublicUser(user: {
    passwordHash: string;
    roles: { role: { name: string } }[];
    [k: string]: unknown;
  }) {
    const userWithRoles = {
      ...user,
      roles: user.roles.map((ur) => ur.role.name),
    };
    const { passwordHash: _p, ...rest } = userWithRoles;
    return rest;
  }
  
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Request() req) {
    return this.authService.issueAccessToken(req.user.id, req.user.email);
  }

  @Post('introspect')
  @HttpCode(HttpStatus.OK)
  async introspect(@Body('token') token: string) {
    return this.authService.introspect(token);
  }
}
