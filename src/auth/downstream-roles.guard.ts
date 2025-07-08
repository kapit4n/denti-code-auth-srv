import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class DownstreamRolesGuard implements CanActivate {
  constructor(private readonly allowedRoles: string[]) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userRolesHeader = request.headers['x-user-roles'] as string;
    if (!userRolesHeader) return false;

    const userRoles = userRolesHeader.split(',');
    return this.allowedRoles.some(role => userRoles.includes(role));
  }
}