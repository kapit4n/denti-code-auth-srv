import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);
    
    try {
      const user = await this.usersService.create({
        email: registerUserDto.email,
        firstName: registerUserDto.firstName,
        lastName: registerUserDto.lastName,
        passwordHash: hashedPassword, 
      });

      const { passwordHash, ...result } = user;
      return result;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('An account with this email already exists.');
      }
      throw error;
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.usersService.findOneByEmail(loginUserDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isPasswordMatching = await bcrypt.compare(loginUserDto.password, user.passwordHash);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
  
  async validateUserById(userId: string) {
    return this.usersService.findOneById(userId);
  }
}
