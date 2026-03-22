import { prisma } from '@repo/db';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email()
});

// Simple in-memory rate limiter: max 5 submissions per IP per hour.
// Good enough for a low-traffic coming-soon page; resets on cold start.
const attempts = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const timestamps = (attempts.get(ip) ?? []).filter((t) => t > windowStart);
  if (timestamps.length >= MAX_ATTEMPTS) return true;
  attempts.set(ip, [...timestamps, now]);
  return false;
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  if (isRateLimited(ip)) {
    return Response.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { email } = schema.parse(body);

    await prisma.waitlistEntry.upsert({
      where: { email },
      create: { email },
      update: {}
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}
