'use client';

import { useState } from 'react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'loading' || status === 'success') return;

    setStatus('loading');
    setErrorMsg('');
    setLeaving(true);

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!res.ok) throw new Error('Something went wrong');
      setStatus('success');
    } catch {
      setLeaving(false);
      setStatus('error');
      setErrorMsg('Something went wrong — please try again.');
    }
  };

  return (
    <div className="max-w-xs">
      <form onSubmit={handleSubmit}>
        {/* Section header — always visible, never changes */}
        <p className="mb-4 text-xs font-medium uppercase tracking-widest text-ink-faint">
          Join the waitlist
        </p>

        <div className="border-b border-ink/35 pb-2">
          {status === 'success' ? (
            <div className="animate-fade-up py-0.5">
              <p className="text-sm leading-snug text-ink-muted">
                You&apos;re in. We&apos;ll be in touch soon.
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Form row — entire row wipes left → right on submit */}
              <div
                style={{
                  clipPath: leaving ? 'inset(0 0 0 100%)' : 'inset(0 0 0 0%)',
                  transition: 'clip-path 250ms ease-in'
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      disabled={status === 'loading'}
                      className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none disabled:opacity-50"
                    />
                  </div>
                  <button
                    type="submit"
                    aria-label="Submit"
                    className="shrink-0 text-accent transition-colors duration-fast hover:text-accent/70"
                  >
                    <svg
                      width="28"
                      height="14"
                      viewBox="0 0 28 14"
                      fill="none"
                      aria-hidden
                      style={{ display: 'block' }}
                    >
                      {/* Serif foot — small perpendicular tick at the tail */}
                      <line
                        x1="2.5"
                        y1="3.5"
                        x2="2.5"
                        y2="10.5"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                      />
                      {/* Shaft */}
                      <line
                        x1="2.5"
                        y1="7"
                        x2="21"
                        y2="7"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                      />
                      {/* Arrowhead — narrow spread, miter tip */}
                      <path
                        d="M15 2.5L23 7L15 11.5"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="miter"
                        fill="none"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Bouncing dots — fade in after the wipe completes */}
              {leaving && (
                <div
                  className="animate-fade-in absolute inset-0 flex items-center"
                  style={{ animationDelay: '250ms', animationDuration: '200ms' }}
                >
                  <div className="flex gap-2">
                    <span
                      className="block h-1.5 w-1.5 animate-bounce-dot rounded-full bg-accent"
                      style={{ animationDelay: '0ms' }}
                    />
                    <span
                      className="block h-1.5 w-1.5 animate-bounce-dot rounded-full bg-accent"
                      style={{ animationDelay: '150ms' }}
                    />
                    <span
                      className="block h-1.5 w-1.5 animate-bounce-dot rounded-full bg-accent"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {status === 'error' && <p className="mt-2 text-[11px] text-red-500">{errorMsg}</p>}
      </form>

      <Disclaimer />
    </div>
  );
};
