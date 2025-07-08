import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsService } from './permissions.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  permission: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('PermissionsService', () => {
  let service: PermissionsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a permission', async () => {
      const createDto = { name: 'test:create', description: 'Test create permission' };
      const expectedResult = { id: 1, ...createDto };
      mockPrismaService.permission.create.mockResolvedValue(expectedResult);

      const result = await service.create(createDto);
      expect(result).toEqual(expectedResult);
      expect(prisma.permission.create).toHaveBeenCalledWith({ data: createDto });
    });
  });

  describe('findAll', () => {
    it('should return an array of permissions', async () => {
      const expectedResult = [{ id: 1, name: 'test:read', description: 'Test read permission' }];
      mockPrismaService.permission.findMany.mockResolvedValue(expectedResult);

      const result = await service.findAll();
      expect(result).toEqual(expectedResult);
      expect(prisma.permission.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single permission', async () => {
      const expectedResult = { id: 1, name: 'test:read', description: 'Test read permission' };
      mockPrismaService.permission.findUnique.mockResolvedValue(expectedResult);

      const result = await service.findOne(1);
      expect(result).toEqual(expectedResult);
      expect(prisma.permission.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if permission is not found', async () => {
      mockPrismaService.permission.findUnique.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a permission', async () => {
      const updateDto = { name: 'test:update' };
      const existingPermission = { id: 1, name: 'test:create', description: 'Old description' };
      const updatedPermission = { ...existingPermission, ...updateDto };

      mockPrismaService.permission.findUnique.mockResolvedValue(existingPermission);
      mockPrismaService.permission.update.mockResolvedValue(updatedPermission);

      const result = await service.update(1, updateDto);
      expect(result).toEqual(updatedPermission);
      expect(prisma.permission.update).toHaveBeenCalledWith({ where: { id: 1 }, data: updateDto });
    });

    it('should throw NotFoundException if permission to update is not found', async () => {
      mockPrismaService.permission.findUnique.mockResolvedValue(null);
      await expect(service.update(99, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a permission', async () => {
      const existingPermission = { id: 1, name: 'test:delete' };
      mockPrismaService.permission.findUnique.mockResolvedValue(existingPermission);
      mockPrismaService.permission.delete.mockResolvedValue(existingPermission);

      await service.remove(1);
      expect(prisma.permission.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if permission to remove is not found', async () => {
      mockPrismaService.permission.findUnique.mockResolvedValue(null);
      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});