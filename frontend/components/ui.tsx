import Link from 'next/link';
import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import type { VerificationStatus } from '@/lib/api';

export function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">{children}</div>
    </main>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-ink/10 bg-paper p-6 shadow-soft ${className}`}>
      {children}
    </section>
  );
}

export function HeaderNav() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3">
      <Link href="/" className="text-sm font-semibold text-ink">
        WhatsApp Verification MVP
      </Link>
      <Link href="/admin" className="text-sm font-medium text-ink/70 hover:text-ink">
        Admin
      </Link>
    </div>
  );
}

export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex min-h-11 items-center justify-center rounded-xl bg-leaf px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-ink/30 ${props.className || ''}`}
    />
  );
}

export function LinkButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-11 items-center justify-center rounded-xl bg-leaf px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
    >
      {children}
    </a>
  );
}

export const TextInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function TextInput({ className = '', ...props }, ref) {
    return (
      <input
        ref={ref}
        {...props}
        className={`w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-base outline-none transition placeholder:text-ink/35 focus:border-leaf focus:ring-4 focus:ring-leaf/15 ${className}`}
      />
    );
  },
);

export function Badge({ status }: { status: VerificationStatus }) {
  const styles: Record<VerificationStatus, string> = {
    PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
    VERIFIED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    EXPIRED: 'bg-red-100 text-red-800 border-red-200',
    FAILED: 'bg-slate-100 text-slate-700 border-slate-200',
    BLOCKED: 'bg-zinc-200 text-zinc-800 border-zinc-300',
  };

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}

export function Alert({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-leaf/20 bg-moss px-4 py-3 text-sm text-ink">{children}</div>;
}
