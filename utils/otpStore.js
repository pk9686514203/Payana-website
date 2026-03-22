const store = new Map();
const TTL_MS = 10 * 60 * 1000;

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.expiresAt < now) store.delete(key);
  }
}

setInterval(cleanup, 60 * 1000).unref?.();

export function setOtp(phone, otp) {
  store.set(phone, { otp, expiresAt: Date.now() + TTL_MS });
}

export function verifyOtp(phone, code) {
  const entry = store.get(phone);
  if (!entry || entry.expiresAt < Date.now()) {
    store.delete(phone);
    return false;
  }
  if (String(entry.otp) !== String(code)) {
    return false;
  }
  store.delete(phone);
  return true;
}
