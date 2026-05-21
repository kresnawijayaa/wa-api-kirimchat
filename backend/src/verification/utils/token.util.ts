import { createHash, randomBytes } from 'crypto';

export function generateVerificationToken() {
  return randomBytes(32).toString('hex');
}

export function hashVerificationToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function previewToken(token: string) {
  return `${token.slice(0, 6)}...${token.slice(-4)}`;
}
