import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const SINGLETON_ID = 'singleton';

@Injectable()
export class AppSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreate() {
    return this.prisma.appSettings.upsert({
      where: { id: SINGLETON_ID },
      create: { id: SINGLETON_ID, defaultLocale: 'en' },
      update: {},
    });
  }

  async setDefaultLocale(locale: string) {
    return this.prisma.appSettings.upsert({
      where: { id: SINGLETON_ID },
      create: { id: SINGLETON_ID, defaultLocale: locale },
      update: { defaultLocale: locale },
    });
  }
}
