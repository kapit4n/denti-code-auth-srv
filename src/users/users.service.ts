import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Used by Auth Service
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  // Used by Auth Service
  async findOneByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  // --- Methods for UsersController (Admin) ---

  findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, firstName: true, lastName: true, isActive: true, roles: { include: { role: true } } },
    });
  }

  async findOneById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } },
    });
    if (!user) {
      throw new NotFoundException(`User with ID #${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOneById(id); // Ensure user exists
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: string) {
    await this.findOneById(id); // Ensure user exists
    return this.prisma.user.delete({ where: { id } });
  }
  
  async assignRole(userId: string, roleId: number) {
    try {
      return await this.prisma.userRole.create({
        data: { userId, roleId },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025' || error.code === 'P2003') {
          throw new NotFoundException(`User or Role not found.`);
        }
        if (error.code === 'P2002') {
          throw new ConflictException(`This role is already assigned to the user.`);
        }
      }
      throw error;
    }
  }
  
  async unassignRole(userId: string, roleId: number) {
     try {
      return await this.prisma.userRole.delete({
        where: { userId_roleId: { userId, roleId } },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`This role is not assigned to the user.`);
      }
      throw error;
    }
  }
}