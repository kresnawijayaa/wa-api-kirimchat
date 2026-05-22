export function parseVerificationToken(text: string) {
  const match = text.match(/Kode Verifikasi\s*:\s*([a-fA-F0-9]{32,128})/i);
  return match?.[1] ?? null;
}

export function extractText(payload: Record<string, unknown>) {
  return firstString(
    payload.text,
    payload.message,
    payload.body,
    payload.content,
    payload.text_message,
    readPath(payload, ['data', 'text']),
    readPath(payload, ['data', 'message', 'text']),
    readPath(payload, ['data', 'message', 'body']),
    readPath(payload, ['data', 'message', 'conversation']),
    readPath(payload, ['data', 'message', 'caption']),
    readPath(payload, ['data', 'message']),
    readPath(payload, ['data', 'body']),
    readPath(payload, ['data', 'content']),
    readPath(payload, ['data', 'text_message']),
    readPath(payload, ['payload', 'text']),
    readPath(payload, ['payload', 'message', 'text']),
    readPath(payload, ['payload', 'message', 'body']),
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
    payload.customer_phone,
    payload.phone_number,
    readPath(payload, ['data', 'from']),
    readPath(payload, ['data', 'sender', 'phone']),
    readPath(payload, ['data', 'sender', 'id']),
    readPath(payload, ['data', 'contact', 'phone']),
    readPath(payload, ['data', 'key', 'remoteJid']),
    readPath(payload, ['data', 'sender']),
    readPath(payload, ['data', 'phone']),
    readPath(payload, ['data', 'customer_phone']),
    readPath(payload, ['data', 'phone_number']),
    readPath(payload, ['customer', 'phone']),
    readPath(payload, ['customer', 'phone_number']),
    readPath(payload, ['payload', 'from']),
    readPath(payload, ['payload', 'sender', 'phone']),
    readPath(payload, ['payload', 'sender', 'id']),
    readPath(payload, ['payload', 'sender']),
    readPath(payload, ['contact', 'phone']),
    readPath(payload, ['sender', 'phone']),
  );
}

export function extractMessageId(payload: Record<string, unknown>) {
  return firstString(
    payload.message_id,
    payload.id,
    payload.messageId,
    readPath(payload, ['data', 'message_id']),
    readPath(payload, ['data', 'id']),
    readPath(payload, ['data', 'messageId']),
    readPath(payload, ['data', 'key', 'id']),
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
