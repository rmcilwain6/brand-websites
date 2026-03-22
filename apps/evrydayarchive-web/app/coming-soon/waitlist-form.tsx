'use client';

import { useState } from 'react';

export const WaitlistForm = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!res.ok) throw new Error('Something went wrong');
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMsg('Something went wrong — please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div>
        <p className="mb-1 text-xs font-medium uppercase tracking-widest text-ink-faint">
          Join the waitlist
        </p>
        <p className="text-sm text-ink-muted">
          You&apos;re on the list — we&apos;ll be in touch when we open.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-ink-faint">
        Join the waitlist
      </p>
      <form onSubmit={handleSubmit} className="max-w-xs">
        <div className="flex items-center gap-3 border-b border-ink/20 pb-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            aria-label="Submit"
            className="shrink-0 text-base text-accent transition-colors duration-fast hover:text-accent/70 disabled:opacity-40"
          >
            {status === 'loading' ? '…' : '→'}
          </button>
        </div>
        {status === 'error' && <p className="mt-2 text-[11px] text-red-500">{errorMsg}</p>}
      </form>
      <p className="mt-3 max-w-xs text-[11px] leading-relaxed text-ink-faint">
        Waitlist members are entered to win a complimentary session and receive an exclusive
        discount on May bookings.
      </p>
    </div>
  );
};
