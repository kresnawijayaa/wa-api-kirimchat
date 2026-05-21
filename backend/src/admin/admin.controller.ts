import { Controller, Get, Headers, Query, UnauthorizedException } from '@nestjs/common';
import { VerificationStatus } from '@prisma/client';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('verifications')
  listVerifications(
    @Headers('x-admin-secret') adminSecret: string | undefined,
    @Query('status') status?: VerificationStatus,
    @Query('phone') phone?: string,
  ) {
    if (!process.env.ADMIN_SECRET || adminSecret !== process.env.ADMIN_SECRET) {
      throw new UnauthorizedException('Admin secret tidak valid.');
    }

    return this.adminService.listVerifications({ status, phone });
  }
}
