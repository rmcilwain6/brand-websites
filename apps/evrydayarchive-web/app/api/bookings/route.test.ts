import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const booking = {
  name: 'Jordan Lee',
  email: 'jordan@example.com',
  location: 'Victoria',
  preferredDate: '2026-11-14',
  packageId: 'pkg_1'
};

const application = {
  ...booking,
  applyToCampaign: true,
  campaignAnswers: { whatWorkingOn: 'A sewing business', acknowledged: true }
};

const post = async (body: unknown) => {
  const { POST } = await import('./route');
  return POST(
    new Request('http://localhost/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
  );
};

describe('POST /api/bookings', () => {
  const fetchMock = vi.fn();

  /** The JSON forwarded to the admin API. */
  const forwarded = () => JSON.parse(fetchMock.mock.calls[0]![1].body as string);

  beforeEach(() => {
    vi.resetModules();
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('ADMIN_API_BASE_URL', 'http://admin.test');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('forwards an application to the admin API', async () => {
    const res = await post(application);

    expect(res.status).toBe(200);
    expect(forwarded()).toMatchObject({
      applyToCampaign: true,
      campaignAnswers: { whatWorkingOn: 'A sewing business', acknowledged: true }
    });
  });

  it('rejects an application missing the required answers without forwarding it', async () => {
    const res = await post({ ...booking, applyToCampaign: true });

    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
