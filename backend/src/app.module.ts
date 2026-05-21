import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { PrismaModule } from './prisma/prisma.module';
import { VerificationModule } from './verification/verification.module';

@Module({
  imports: [PrismaModule, VerificationModule, AdminModule],
})
export class AppModule {}
