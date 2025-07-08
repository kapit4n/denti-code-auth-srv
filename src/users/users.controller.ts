import { Controller, Get, Body, Patch, Param, Delete, UseGuards, Post, HttpCode, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard) // Protect all routes in this controller
@Roles('ADMIN') // Only ADMINs can access any of these endpoints
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOneById(id);
    const { passwordHash, ...result } = user; // Never return the password hash
    return result;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(id, updateUserDto);
    const { passwordHash, ...result } = user;
    return result;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // --- Assign/Unassign Roles ---
  @Post(':id/roles')
  @HttpCode(HttpStatus.CREATED)
  assignRole(@Param('id') userId: string, @Body() assignRoleDto: AssignRoleDto) {
    return this.usersService.assignRole(userId, assignRoleDto.roleId);
  }

  @Delete(':id/roles/:roleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  unassignRole(@Param('id') userId: string, @Param('roleId', ParseIntPipe) roleId: number) {
    return this.usersService.unassignRole(userId, roleId);
  }
}