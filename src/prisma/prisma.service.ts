import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { requireEnv } from '../config/env';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    requireEnv('DATABASE_URL');
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}