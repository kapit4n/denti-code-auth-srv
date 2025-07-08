import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // So you can use ConfigService app-wide
    }),
    PrismaModule,        // Provides PrismaService globally
    AuthModule,          // Registers /auth routes
    UsersModule,         // Registers /users routes
    RolesModule,         // Registers /roles routes
    PermissionsModule,   // Registers /permissions routes
  ],
  // No controllers or providers are needed here as they are handled by the imported modules.
})
export class AppModule {}