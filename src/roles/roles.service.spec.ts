import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

const mockPrismaService = {
  role: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  rolePermission: {
    create: jest.fn(),
    delete: jest.fn(),
  },
};

describe('RolesService', () => {
  let service: RolesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a role', async () => {
      const createDto = { name: 'ADMIN', description: 'Administrator' };
      const expectedResult = { id: 1, ...createDto };
      mockPrismaService.role.create.mockResolvedValue(expectedResult);

      const result = await service.create(createDto);
      expect(result).toEqual(expectedResult);
      expect(prisma.role.create).toHaveBeenCalledWith({ data: createDto });
    });

    it('should throw ConflictException on unique constraint violation', async () => {
      const createDto = { name: 'ADMIN' };
      const error = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', { code: 'P2002', clientVersion: '' });
      mockPrismaService.role.create.mockRejectedValue(error);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should return a single role with permissions', async () => {
      const expectedResult = { id: 1, name: 'ADMIN', permissions: [] };
      mockPrismaService.role.findUnique.mockResolvedValue(expectedResult);

      const result = await service.findOne(1);
      expect(result).toEqual(expectedResult);
      expect(prisma.role.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { permissions: { include: { permission: true } } },
      });
    });

    it('should throw NotFoundException if role is not found', async () => {
      mockPrismaService.role.findUnique.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('assignPermission', () => {
    it('should assign a permission to a role', async () => {
      const roleId = 1;
      const permissionId = 10;
      const expectedResult = { roleId, permissionId, assignedAt: new Date() };
      mockPrismaService.rolePermission.create.mockResolvedValue(expectedResult);

      const result = await service.assignPermission(roleId, permissionId);
      expect(result).toEqual(expectedResult);
      expect(prisma.rolePermission.create).toHaveBeenCalledWith({
        data: { roleId, permissionId },
      });
    });

    it('should throw NotFoundException if role or permission does not exist', async () => {
      const error = new Prisma.PrismaClientKnownRequestError('Not found', { code: 'P2003', clientVersion: '' });
      mockPrismaService.rolePermission.create.mockRejectedValue(error);

      await expect(service.assignPermission(1, 99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('unassignPermission', () => {
    it('should unassign a permission from a role', async () => {
      const roleId = 1;
      const permissionId = 10;
      mockPrismaService.rolePermission.delete.mockResolvedValue({});

      await service.unassignPermission(roleId, permissionId);
      expect(prisma.rolePermission.delete).toHaveBeenCalledWith({
        where: { roleId_permissionId: { roleId, permissionId } },
      });
    });

    it('should throw NotFoundException if the assignment does not exist', async () => {
      const error = new Prisma.PrismaClientKnownRequestError('Record to delete does not exist', { code: 'P2025', clientVersion: '' });
      mockPrismaService.rolePermission.delete.mockRejectedValue(error);

      await expect(service.unassignPermission(1, 99)).rejects.toThrow(NotFoundException);
    });
  });
});
