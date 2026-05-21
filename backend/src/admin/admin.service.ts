import { Injectable } from '@nestjs/common';
import { VerificationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeIndonesianPhone } from '../verification/utils/phone.util';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listVerifications(filters: { status?: VerificationStatus; phone?: string }) {
    const normalizedPhone = filters.phone ? normalizeIndonesianPhone(filters.phone) : undefined;

    const rows = await this.prisma.verificationRequest.findMany({
      where: {
        status: filters.status,
        normalizedPhone,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
      select: {
        id: true,
        phone: true,
        normalizedPhone: true,
        tokenPreview: true,
        status: true,
        expiredAt: true,
        verifiedAt: true,
        createdAt: true,
      },
    });

    return rows.map((row) => ({
      id: row.id,
      phone: row.normalizedPhone,
      tokenPreview: row.tokenPreview,
      status: row.status,
      expiredAt: row.expiredAt,
      verifiedAt: row.verifiedAt,
      createdAt: row.createdAt,
    }));
  }
}
