import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client'; // Import Prisma for error type

// Mock the dependencies
const mockUsersService = {
  create: jest.fn(),
  findOneByEmail: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks between tests
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should hash the password and create a new user', async () => {
      const registerDto = { email: 'test@test.com', password: 'password', firstName: 'Test', lastName: 'User' };
      const hashedPassword = 'hashedPassword';
      // The user object returned by the service doesn't have the password property
      const savedUser = { id: '1', email: registerDto.email, firstName: registerDto.firstName, lastName: registerDto.lastName, passwordHash: hashedPassword };
      
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      mockUsersService.create.mockResolvedValue(savedUser);

      const result = await service.register(registerDto);
      
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);

      // --- FIX 1: Match the exact object sent to usersService.create ---
      // The service code constructs an object without the 'password' field.
      // The test must expect the object exactly as it is created in the service.
      expect(mockUsersService.create).toHaveBeenCalledWith({
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        passwordHash: hashedPassword,
      });
      
      expect(result).not.toHaveProperty('passwordHash'); // Ensure hash is not returned
      expect(result.email).toEqual(registerDto.email);
    });

    it('should throw a ConflictException if email already exists', async () => {
      const registerDto = { email: 'test@test.com', password: 'password', firstName: 'Test', lastName: 'User' };

      // --- FIX 2: Mock with a proper instance of the Prisma error ---
      // The service code uses `instanceof Prisma.PrismaClientKnownRequestError`.
      // The mock must reject with an actual instance of this error for the `instanceof` check to pass.
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        { code: 'P2002', clientVersion: 'test' }
      );
      mockUsersService.create.mockRejectedValue(prismaError);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return an access token for valid credentials', async () => {
      const loginDto = { email: 'test@test.com', password: 'password' };
      const user = { id: '1', email: 'test@test.com', passwordHash: 'hashedPassword' };
      const token = 'jwt-token';

      mockUsersService.findOneByEmail.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockJwtService.sign.mockReturnValue(token);

      const result = await service.login(loginDto);
      
      expect(mockUsersService.findOneByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, user.passwordHash);
      expect(mockJwtService.sign).toHaveBeenCalledWith({ sub: user.id, email: user.email });
      expect(result).toEqual({ access_token: token });
    });

    it('should throw UnauthorizedException for an invalid password', async () => {
      const loginDto = { email: 'test@test.com', password: 'wrong-password' };
      const user = { id: '1', email: 'test@test.com', passwordHash: 'hashedPassword' };

      mockUsersService.findOneByEmail.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
        const loginDto = { email: 'test@test.com', password: 'password' };
        mockUsersService.findOneByEmail.mockResolvedValue(null);

        await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});