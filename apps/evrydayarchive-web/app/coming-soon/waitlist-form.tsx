'use client';

import { useState } from 'react';

// How long the arrow spin plays before we transition to the success state.
// Promise.all ensures the fetch and this delay both complete before swapping.
const SPIN_DURATION = 1400;

const ArrowIcon = ({ spinning }: { spinning: boolean }) => (
  <svg
    width="22"
    height="14"
    viewBox="0 0 22 14"
    fill="none"
    aria-hidden
    className={spinning ? 'animate-arrow-spin' : ''}
    style={{ display: 'block', transformBox: 'fill-box', transformOrigin: 'center' }}
  >
    <line
      x1="0"
      y1="7"
      x2="17"
      y2="7"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
    <path
      d="M11 1L18 7L11 13"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

const Disclaimer = () => (
  <p className="mt-3 max-w-xs text-xs leading-relaxed text-ink-faint">
    Waitlist members are entered to win a complimentary session and receive an exclusive discount on
    May bookings.
  </p>
);

export const WaitlistForm = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [leaving, setLeaving] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setIsSpinning(true);
    setErrorMsg('');

    try {
      // Wait for both the fetch and the full spin animation before transitioning.
      const [res] = await Promise.all([
        fetch('/api/waitlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        }),
        new Promise<void>((resolve) => setTimeout(resolve, SPIN_DURATION))
      ]);

      if (!res.ok) throw new Error('Something went wrong');
      setLeaving(true);
      setTimeout(() => setStatus('success'), 220);
    } catch {
      setIsSpinning(false);
      setStatus('error');
      setErrorMsg('Something went wrong — please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div>
        <div className="animate-fade-up">
          <p className="mb-1 text-xs font-medium uppercase tracking-widest text-ink-faint">
            You&apos;re in.
          </p>
          <p className="text-sm text-ink-muted">
            First through the door. We&apos;ll be in touch soon.
          </p>
        </div>
        <Disclaimer />
      </div>
    );
  }

  return (
    <div style={{ opacity: leaving ? 0 : 1, transition: 'opacity 200ms ease' }}>
      <p className="mb-4 text-xs font-medium uppercase tracking-widest text-ink-faint">
        Join the waitlist
      </p>
      <form onSubmit={handleSubmit} className="max-w-xs">
        <div className="flex items-center gap-3 border-b border-ink/35 pb-2">
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
            className="shrink-0 text-accent transition-colors duration-fast hover:text-accent/70 disabled:opacity-40"
          >
            <ArrowIcon spinning={isSpinning} />
          </button>
        </div>
        {status === 'error' && <p className="mt-2 text-[11px] text-red-500">{errorMsg}</p>}
      </form>
      <Disclaimer />
    </div>
  );
};
