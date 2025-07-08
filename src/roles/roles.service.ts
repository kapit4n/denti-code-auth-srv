import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    try {
      return await this.prisma.role.create({ data: createRoleDto });
    } catch(error) {
       if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`Role with name '${createRoleDto.name}' already exists.`);
      }
      throw error;
    }
  }

  findAll() {
    return this.prisma.role.findMany({ include: { permissions: { include: { permission: true } } } });
  }

  async findOne(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { permissions: { include: { permission: true } } },
    });
    if (!role) {
      throw new NotFoundException(`Role with ID #${id} not found`);
    }
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    await this.findOne(id);
    return this.prisma.role.update({
      where: { id },
      data: updateRoleDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.role.delete({ where: { id } });
  }
  
  async assignPermission(roleId: number, permissionId: number) {
    // This logic ensures both role and permission exist before linking
    return this.prisma.rolePermission.create({
        data: {
            roleId,
            permissionId,
        },
    }).catch(error => {
        if(error.code === 'P2003' || error.code === 'P2025') {
            throw new NotFoundException(`Role or Permission not found.`);
        }
        if(error.code === 'P2002') {
             throw new ConflictException(`This permission is already assigned to the role.`);
        }
        throw error;
    });
  }
  
  async unassignPermission(roleId: number, permissionId: number) {
    return this.prisma.rolePermission.delete({
        where: {
            roleId_permissionId: {
                roleId,
                permissionId,
            },
        },
    }).catch(error => {
        if(error.code === 'P2025') {
            throw new NotFoundException(`This permission is not assigned to the role.`);
        }
        throw error;
    });
  }
}
