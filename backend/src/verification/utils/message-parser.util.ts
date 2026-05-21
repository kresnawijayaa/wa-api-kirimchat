export function parseVerificationToken(text: string) {
  const match = text.match(/Kode Verifikasi\s*:\s*([a-fA-F0-9]{32,128})/i);
  return match?.[1] ?? null;
}

export function extractText(payload: Record<string, unknown>) {
  return firstString(
    payload.text,
    payload.message,
    payload.body,
    readPath(payload, ['data', 'text']),
    readPath(payload, ['data', 'message']),
    readPath(payload, ['data', 'body']),
    readPath(payload, ['payload', 'text']),
    readPath(payload, ['payload', 'message']),
    readPath(payload, ['message', 'text']),
    readPath(payload, ['message', 'body']),
  );
}

export function extractSender(payload: Record<string, unknown>) {
  return firstString(
    payload.from,
    payload.sender,
    payload.phone,
    readPath(payload, ['data', 'from']),
    readPath(payload, ['data', 'sender']),
    readPath(payload, ['data', 'phone']),
    readPath(payload, ['payload', 'from']),
    readPath(payload, ['payload', 'sender']),
    readPath(payload, ['contact', 'phone']),
    readPath(payload, ['sender', 'phone']),
  );
}

export function extractMessageId(payload: Record<string, unknown>) {
  return firstString(
    payload.message_id,
    payload.id,
    readPath(payload, ['data', 'message_id']),
    readPath(payload, ['message', 'id']),
  );
}

function firstString(...values: unknown[]) {
  const value = values.find((item) => typeof item === 'string' && item.trim().length > 0);
  return typeof value === 'string' ? value.trim() : null;
}

function readPath(payload: Record<string, unknown>, path: string[]) {
  let current: unknown = payload;

  for (const key of path) {
    if (!current || typeof current !== 'object' || !(key in current)) {
      return null;
    }

    current = (current as Record<string, unknown>)[key];
  }

  return current;
}
