import { BadRequestException } from '@nestjs/common';

export function normalizeIndonesianPhone(phone: string) {
  const cleaned = phone
    .split('@')[0]
    .replace(/:\d+$/, '')
    .replace(/[\s\-().]/g, '')
    .replace(/^\+/, '');

  if (!/^\d+$/.test(cleaned)) {
    throw new BadRequestException('Nomor WhatsApp hanya boleh berisi angka dan tanda format umum.');
  }

  if (cleaned.startsWith('08')) {
    return `62${cleaned.slice(1)}`;
  }

  if (cleaned.startsWith('628')) {
    return cleaned;
  }

  if (cleaned.startsWith('8')) {
    return `62${cleaned}`;
  }

  throw new BadRequestException('Gunakan nomor WhatsApp Indonesia yang valid, contoh 081234567890.');
}
