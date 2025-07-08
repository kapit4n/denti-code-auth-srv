import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  create(createPermissionDto: CreatePermissionDto) {
    return this.prisma.permission.create({ data: createPermissionDto });
  }

  findAll() {
    return this.prisma.permission.findMany();
  }

  async findOne(id: number) {
    const permission = await this.prisma.permission.findUnique({ where: { id } });
    if (!permission) {
      throw new NotFoundException(`Permission with ID #${id} not found`);
    }
    return permission;
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    await this.findOne(id);
    return this.prisma.permission.update({
      where: { id },
      data: updatePermissionDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.permission.delete({ where: { id } });
  }
}
