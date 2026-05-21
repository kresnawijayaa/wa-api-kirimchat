'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Card, HeaderNav, LinkButton, Shell } from '@/components/ui';
import { apiFetch, type VerificationDetail, type VerificationStatusResponse } from '@/lib/api';

export default function VerifyPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [detail, setDetail] = useState<VerificationDetail | null>(null);
  const [error, setError] = useState('');

  const whatsappUrl = useMemo(() => {
    if (detail?.whatsappUrl) return detail.whatsappUrl;
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(`verification:${id}:whatsappUrl`);
  }, [detail?.whatsappUrl, id]);

  useEffect(() => {
    let active = true;

    async function loadDetail() {
      try {
        const data = await apiFetch<VerificationDetail>(`/verification/${id}`);
        if (active) setDetail(data);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Gagal mengambil detail verifikasi.');
      }
    }

    loadDetail();
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!detail || detail.status !== 'PENDING') return;

    const timer = window.setInterval(async () => {
      try {
        const status = await apiFetch<VerificationStatusResponse>(`/verification/${id}/status`);
        setDetail((current) => (current ? { ...current, ...status } : current));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memperbarui status.');
      }
    }, 3000);

    return () => window.clearInterval(timer);
  }, [detail, id]);

  return (
    <Shell>
      <HeaderNav />
      <Card className="mx-auto w-full max-w-3xl">
        {!detail && !error && <p className="text-ink/70">Memuat status verifikasi...</p>}
        {error && <Alert>{error}</Alert>}

        {detail && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-ink">Status Verifikasi</h1>
                <p className="mt-2 text-ink/65">{detail.phone}</p>
              </div>
              <Badge status={detail.status} />
            </div>

            <div className="grid gap-3 rounded-xl border border-ink/10 bg-white p-4 text-sm sm:grid-cols-2">
              <div>
                <p className="font-semibold text-ink">Batas waktu</p>
                <p className="text-ink/65">{new Date(detail.expiredAt).toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="font-semibold text-ink">Terverifikasi</p>
                <p className="text-ink/65">
                  {detail.verifiedAt ? new Date(detail.verifiedAt).toLocaleString('id-ID') : '-'}
                </p>
              </div>
            </div>

            {detail.status === 'PENDING' && (
              <div className="space-y-4">
                <Alert>Jangan mengubah isi pesan WhatsApp. Sistem membaca token dan nomor pengirim dari pesan itu.</Alert>
                {whatsappUrl && <LinkButton href={whatsappUrl}>Kirim Verifikasi via WhatsApp</LinkButton>}
                {detail.messageText && (
                  <pre className="overflow-auto rounded-xl border border-ink/10 bg-white p-4 text-sm leading-6 text-ink/80">
                    {detail.messageText}
                  </pre>
                )}
              </div>
            )}

            {detail.status === 'VERIFIED' && (
              <Alert>Nomor WhatsApp berhasil diverifikasi.</Alert>
            )}

            {detail.status === 'EXPIRED' && (
              <div className="space-y-4">
                <Alert>Kode verifikasi sudah kedaluwarsa.</Alert>
                <Link href="/" className="inline-flex rounded-xl bg-leaf px-5 py-3 text-sm font-semibold text-white">
                  Buat kode baru
                </Link>
              </div>
            )}
          </div>
        )}
      </Card>
    </Shell>
  );
}
