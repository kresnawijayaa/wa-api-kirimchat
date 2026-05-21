export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'EXPIRED' | 'FAILED' | 'BLOCKED';

export type VerificationDetail = {
  id: string;
  phone: string;
  status: VerificationStatus;
  expiredAt: string;
  verifiedAt: string | null;
  messageText: string | null;
  whatsappUrl: string | null;
};

export type VerificationStatusResponse = {
  id: string;
  phone: string;
  status: VerificationStatus;
  verifiedAt: string | null;
  expiredAt: string;
};

export async function apiFetch<T>(path: string, options?: RequestInit) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = Array.isArray(data.message) ? data.message[0] : data.message;
    throw new Error(message || 'Terjadi kesalahan. Coba lagi.');
  }

  return data as T;
}
