'use client';

import { useEffect, useState } from 'react';
import { Alert, Badge, Card, HeaderNav, PrimaryButton, Shell, TextInput } from '@/components/ui';
import { API_URL, type VerificationStatus } from '@/lib/api';

type AdminRow = {
  id: string;
  phone: string;
  tokenPreview: string;
  status: VerificationStatus;
  expiredAt: string;
  verifiedAt: string | null;
  createdAt: string;
};

const statuses = ['', 'PENDING', 'VERIFIED', 'EXPIRED', 'FAILED', 'BLOCKED'] as const;

export default function AdminPage() {
  const [secret, setSecret] = useState('');
  const [status, setStatus] = useState('');
  const [phone, setPhone] = useState('');
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSecret(localStorage.getItem('adminSecret') || '');
  }, []);

  async function loadRows() {
    setError('');
    setLoading(true);
    localStorage.setItem('adminSecret', secret);

    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (phone) params.set('phone', phone);

    try {
      const response = await fetch(`${API_URL}/admin/verifications?${params.toString()}`, {
        headers: {
          'x-admin-secret': secret,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal mengambil data admin.');
      }

      setRows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengambil data admin.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell>
      <HeaderNav />
      <Card>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-ink">Admin Verifikasi</h1>
          <p className="mt-2 text-ink/65">Pantau request verifikasi terbaru dan statusnya.</p>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_180px_1fr_auto]">
          <TextInput
            type="password"
            placeholder="Admin secret"
            value={secret}
            onChange={(event) => setSecret(event.target.value)}
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none focus:border-leaf focus:ring-4 focus:ring-leaf/15"
          >
            {statuses.map((item) => (
              <option key={item || 'ALL'} value={item}>
                {item || 'Semua status'}
              </option>
            ))}
          </select>
          <TextInput placeholder="Filter nomor" value={phone} onChange={(event) => setPhone(event.target.value)} />
          <PrimaryButton type="button" onClick={loadRows} disabled={loading}>
            {loading ? 'Memuat...' : 'Tampilkan'}
          </PrimaryButton>
        </div>

        {error && <div className="mt-4"><Alert>{error}</Alert></div>}

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-ink/60">
                <th className="py-3 pr-4 font-semibold">Phone</th>
                <th className="py-3 pr-4 font-semibold">Token</th>
                <th className="py-3 pr-4 font-semibold">Status</th>
                <th className="py-3 pr-4 font-semibold">Expired</th>
                <th className="py-3 pr-4 font-semibold">Verified</th>
                <th className="py-3 pr-4 font-semibold">Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-ink/10">
                  <td className="py-4 pr-4 font-medium text-ink">{row.phone}</td>
                  <td className="py-4 pr-4 text-ink/70">{row.tokenPreview}</td>
                  <td className="py-4 pr-4"><Badge status={row.status} /></td>
                  <td className="py-4 pr-4 text-ink/70">{new Date(row.expiredAt).toLocaleString('id-ID')}</td>
                  <td className="py-4 pr-4 text-ink/70">
                    {row.verifiedAt ? new Date(row.verifiedAt).toLocaleString('id-ID') : '-'}
                  </td>
                  <td className="py-4 pr-4 text-ink/70">{new Date(row.createdAt).toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="py-8 text-center text-ink/55">Belum ada data untuk ditampilkan.</p>}
        </div>
      </Card>
    </Shell>
  );
}
