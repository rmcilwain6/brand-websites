import { prisma } from '@repo/db';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email()
});

export async function POST(req: Request) {
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
