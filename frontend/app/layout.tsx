import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Verifikasi WhatsApp Gratis',
  description: 'MVP verifikasi nomor WhatsApp via pesan manual.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
