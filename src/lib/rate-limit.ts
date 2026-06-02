const buckets = new Map<string, { count: number; reset: number }>();

/** Límite simple en memoria por IP (por instancia serverless). */
export function rateLimit(
  key: string,
  limit = 60,
  windowMs = 60_000,
): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || now > entry.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true };
  }
  if (entry.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((entry.reset - now) / 1000) };
  }
  entry.count += 1;
  return { ok: true };
}

export function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
