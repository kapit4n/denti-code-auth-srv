import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

const mockPrismaService = {
  user: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  userRole: {
    create: jest.fn(),
    delete: jest.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users without password hashes', async () => {
      const users = [{ id: '1', email: 'test@test.com' }];
      mockPrismaService.user.findMany.mockResolvedValue(users);

      const result = await service.findAll();
      expect(result).toEqual(users);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          roles: { include: { role: true } },
        },
      });
    });
  });

  describe('findOneById', () => {
    it('should return a single user with roles', async () => {
      const user = { id: '1', email: 'test@test.com', roles: [] };
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.findOneById('1');
      expect(result).toEqual(user);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { roles: { include: { role: true } } },
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(service.findOneById('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateDto = { firstName: 'Updated' };
      const existingUser = { id: '1', firstName: 'Original' };
      const updatedUser = { ...existingUser, ...updateDto };

      // Mock findOneById to resolve successfully
      jest.spyOn(service, 'findOneById').mockResolvedValue(existingUser as any);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update('1', updateDto);
      expect(result).toEqual(updatedUser);
      expect(service.findOneById).toHaveBeenCalledWith('1');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateDto,
      });
    });
  });

  describe('assignRole', () => {
    it('should assign a role to a user', async () => {
      const userId = 'user-1';
      const roleId = 1;
      const expectedResult = { userId, roleId, assignedAt: new Date() };
      mockPrismaService.userRole.create.mockResolvedValue(expectedResult);

      const result = await service.assignRole(userId, roleId);
      expect(result).toEqual(expectedResult);
      expect(prisma.userRole.create).toHaveBeenCalledWith({
        data: { userId, roleId },
      });
    });

    it('should throw NotFoundException if user or role does not exist', async () => {
      const error = new Prisma.PrismaClientKnownRequestError('Not found', { code: 'P2003', clientVersion: '' });
      mockPrismaService.userRole.create.mockRejectedValue(error);
      await expect(service.assignRole('user-1', 99)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if role is already assigned', async () => {
        const error = new Prisma.PrismaClientKnownRequestError('Conflict', { code: 'P2002', clientVersion: '' });
        mockPrismaService.userRole.create.mockRejectedValue(error);
        await expect(service.assignRole('user-1', 1)).rejects.toThrow(ConflictException);
    });
  });

  describe('unassignRole', () => {
    it('should unassign a role from a user', async () => {
      const userId = 'user-1';
      const roleId = 1;
      mockPrismaService.userRole.delete.mockResolvedValue({});

      await service.unassignRole(userId, roleId);
      expect(prisma.userRole.delete).toHaveBeenCalledWith({
        where: { userId_roleId: { userId, roleId } },
      });
    });

    it('should throw NotFoundException if the role assignment does not exist', async () => {
      const error = new Prisma.PrismaClientKnownRequestError('Record to delete does not exist.', { code: 'P2025', clientVersion: '' });
      mockPrismaService.userRole.delete.mockRejectedValue(error);
      await expect(service.unassignRole('user-1', 99)).rejects.toThrow(NotFoundException);
    });
  });
});
