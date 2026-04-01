'use client';

import { useState } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'error';

export const FooterEmailCapture = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'loading' || status === 'success') return;
    setStatus('loading');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!res.ok) throw new Error();
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div>
      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-ink-faint">
        Get updates
      </p>
      <form onSubmit={handleSubmit}>
        <div className="border-b border-ink/35 pb-2">
          {status === 'success' ? (
            <p className="py-0.5 text-sm text-ink-muted">You&apos;re in. Talk soon.</p>
          ) : (
            <div className="flex items-center gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={status === 'loading'}
                className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                disabled={status === 'loading'}
                className="shrink-0 text-accent transition-colors duration-fast hover:text-accent/70 disabled:opacity-50"
              >
                <svg
                  width="26"
                  height="12"
                  viewBox="0 0 26 12"
                  fill="none"
                  aria-hidden
                  style={{ display: 'block' }}
                >
                  <line
                    x1="0"
                    y1="6"
                    x2="19"
                    y2="6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="butt"
                  />
                  <path
                    d="M13 1L21 6L13 11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="butt"
                    strokeLinejoin="miter"
                    fill="none"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
        {status === 'error' && (
          <p className="mt-2 text-[11px] text-red-500">Something went wrong — try again.</p>
        )}
      </form>
    </div>
  );
};
