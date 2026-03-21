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
      <p className="text-sm text-ink-muted">
        You&apos;re on the list — we&apos;ll reach out when we open.
      </p>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex max-w-sm gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="min-w-0 flex-1 border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-ink/20"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="border border-border bg-surface px-4 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-canvas hover:text-ink disabled:opacity-50"
        >
          {status === 'loading' ? '...' : 'Notify me'}
        </button>
      </form>
      {status === 'error' && <p className="mt-2 text-xs text-red-500">{errorMsg}</p>}
    </div>
  );
};
