import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, VerificationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  extractMessageId,
  extractSender,
  extractText,
  parseVerificationToken,
} from './utils/message-parser.util';
import { normalizeIndonesianPhone } from './utils/phone.util';
import {
  generateVerificationToken,
  hashVerificationToken,
  previewToken,
} from './utils/token.util';

@Injectable()
export class VerificationService {
  constructor(private readonly prisma: PrismaService) {}

  async createRequest(phone: string) {
    const normalizedPhone = normalizeIndonesianPhone(phone);
    await this.assertRateLimit(normalizedPhone);

    const token = generateVerificationToken();
    const tokenHash = hashVerificationToken(token);
    const expiredAt = new Date(Date.now() + 10 * 60 * 1000);
    const messageText = this.buildVerificationMessage(token);
    const botNumber = this.getBotNumber();

    const request = await this.prisma.verificationRequest.create({
      data: {
        phone,
        normalizedPhone,
        tokenHash,
        tokenPreview: previewToken(token),
        messageText,
        expiredAt,
      },
    });

    return {
      id: request.id,
      phone: request.normalizedPhone,
      status: request.status,
      expiredAt: request.expiredAt,
      messageText: request.messageText,
      whatsappUrl: this.buildWhatsAppUrl(botNumber, request.messageText),
    };
  }

  async getDetail(id: string) {
    const request = await this.findRequestOrThrow(id);
    const updated = await this.expireIfNeeded(request);

    return {
      id: updated.id,
      phone: updated.normalizedPhone,
      status: updated.status,
      expiredAt: updated.expiredAt,
      verifiedAt: updated.verifiedAt,
      messageText: updated.status === VerificationStatus.PENDING ? updated.messageText : null,
      whatsappUrl:
        updated.status === VerificationStatus.PENDING
          ? this.buildWhatsAppUrl(this.getBotNumber(), updated.messageText)
          : null,
    };
  }

  async getStatus(id: string) {
    const request = await this.findRequestOrThrow(id);
    const updated = await this.expireIfNeeded(request);

    return {
      id: updated.id,
      phone: updated.normalizedPhone,
      status: updated.status,
      verifiedAt: updated.verifiedAt,
      expiredAt: updated.expiredAt,
    };
  }

  async handleWebhook(payload: Record<string, unknown>) {
    const sender = extractSender(payload);
    const text = extractText(payload);

    if (!sender || !text) {
      console.warn('Webhook ignored: sender atau text tidak ditemukan.', payload);
      return { ok: true };
    }

    let normalizedSender: string;

    try {
      normalizedSender = normalizeIndonesianPhone(sender);
    } catch (error) {
      console.warn('Webhook ignored: nomor pengirim tidak valid.', { sender });
      return { ok: true };
    }

    const token = parseVerificationToken(text);

    if (!token) {
      console.warn('Webhook ignored: token verifikasi tidak ditemukan.', { normalizedSender });
      return { ok: true };
    }

    const tokenHash = hashVerificationToken(token);
    const now = new Date();
    const request = await this.prisma.verificationRequest.findFirst({
      where: {
        tokenHash,
        normalizedPhone: normalizedSender,
        status: VerificationStatus.PENDING,
        expiredAt: {
          gt: now,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!request) {
      console.warn('Webhook ignored: token tidak cocok, nomor berbeda, expired, atau sudah dipakai.', {
        normalizedSender,
        tokenPreview: previewToken(token),
      });
      return { ok: true };
    }

    await this.prisma.verificationRequest.update({
      where: { id: request.id },
      data: {
        status: VerificationStatus.VERIFIED,
        verifiedAt: now,
        waSender: normalizedSender,
        waMessageId: extractMessageId(payload),
        rawWebhook: payload as Prisma.InputJsonObject,
      },
    });

    console.log('Verification request marked VERIFIED.', {
      id: request.id,
      normalizedSender,
    });

    return { ok: true };
  }

  private async assertRateLimit(normalizedPhone: string) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await this.prisma.verificationRequest.count({
      where: {
        normalizedPhone,
        createdAt: {
          gt: oneHourAgo,
        },
      },
    });

    if (recentCount >= 5) {
      throw new HttpException('Terlalu banyak permintaan. Coba lagi dalam beberapa saat.', HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  private buildVerificationMessage(token: string) {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = String(now.getFullYear());
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');

    return [
      'Verifikasi Akun - Mohon tidak mengubah isi teks verifikasi ini.',
      '',
      `Tgl/Jam : ${dd}${mm}${yyyy} - ${hh}:${min}`,
      `Kode Verifikasi : ${token}`,
      '',
      'Pastikan nomor WhatsApp ini sama dengan nomor yang kamu gunakan untuk registrasi.',
      'Kirim teks ini tanpa mengubah isi untuk melakukan verifikasi, lalu silakan kembali ke website.',
    ].join('\n');
  }

  private buildWhatsAppUrl(botNumber: string, messageText: string) {
    return `https://wa.me/${botNumber}?text=${encodeURIComponent(messageText)}`;
  }

  private getBotNumber() {
    const botNumber = process.env.WHATSAPP_BOT_NUMBER;

    if (!botNumber) {
      throw new BadRequestException('WHATSAPP_BOT_NUMBER belum dikonfigurasi.');
    }

    return normalizeIndonesianPhone(botNumber);
  }

  private async findRequestOrThrow(id: string) {
    const request = await this.prisma.verificationRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Request verifikasi tidak ditemukan.');
    }

    return request;
  }

  private async expireIfNeeded<T extends { id: string; status: VerificationStatus; expiredAt: Date }>(request: T) {
    if (request.status !== VerificationStatus.PENDING || request.expiredAt > new Date()) {
      return request;
    }

    return this.prisma.verificationRequest.update({
      where: { id: request.id },
      data: { status: VerificationStatus.EXPIRED },
    });
  }
}
