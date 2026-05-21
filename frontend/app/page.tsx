'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert, Card, HeaderNav, PrimaryButton, Shell, TextInput } from '@/components/ui';
import { apiFetch } from '@/lib/api';

const schema = z.object({
  phone: z
    .string()
    .min(1, 'Nomor WhatsApp wajib diisi.')
    .refine((value) => value.replace(/\D/g, '').length >= 9, 'Nomor WhatsApp minimal 9 digit.'),
});

type FormValues = z.infer<typeof schema>;

type CreateResponse = {
  id: string;
  phone: string;
  status: string;
  expiredAt: string;
  messageText: string;
  whatsappUrl: string;
};

export default function HomePage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { phone: '' },
  });

  async function onSubmit(values: FormValues) {
    setError('');

    try {
      const result = await apiFetch<CreateResponse>('/verification/request', {
        method: 'POST',
        body: JSON.stringify(values),
      });

      localStorage.setItem(`verification:${result.id}:whatsappUrl`, result.whatsappUrl);
      router.push(`/verify/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat kode verifikasi.');
    }
  }

  return (
    <Shell>
      <HeaderNav />
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="py-4 sm:py-10">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-leaf">
            OTP tanpa biaya template awal
          </p>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight text-ink sm:text-5xl">
            Verifikasi WhatsApp Gratis
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-ink/70">
            Klik tombol verifikasi, kirim pesan otomatis ke WhatsApp kami, lalu kembali ke halaman ini.
          </p>
        </section>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-ink">
                Nomor WhatsApp
              </label>
              <TextInput id="phone" placeholder="081234567890" inputMode="tel" {...register('phone')} />
              {errors.phone && <p className="mt-2 text-sm text-red-700">{errors.phone.message}</p>}
            </div>

            {error && <Alert>{error}</Alert>}

            <PrimaryButton type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Membuat kode...' : 'Buat Kode Verifikasi'}
            </PrimaryButton>
          </form>
        </Card>
      </div>
    </Shell>
  );
}
