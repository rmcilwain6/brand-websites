'use client';

import { useRef, useState } from 'react';

const Disclaimer = () => (
  <div className="mt-3 max-w-xs space-y-1.5">
    <p className="text-xs leading-relaxed text-ink-faint">
      {
        'Waitlist members get 5 extra images on their first session, and are entered to win a complimentary shoot.'
      }
    </p>
    <p className="text-xs leading-relaxed text-ink-faint">
      {
        'By signing up you agree to receive occasional emails from Evryday Archive Co. You can unsubscribe at any time.'
      }
    </p>
  </div>
);

type Status = 'idle' | 'loading' | 'exiting' | 'success' | 'error';

export const WaitlistForm = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [leaving, setLeaving] = useState(false);
  const loadingStartRef = useRef<number>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'loading' || status === 'success') return;

    setStatus('loading');
    setErrorMsg('');
    setLeaving(true);
    loadingStartRef.current = Date.now();

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!res.ok) throw new Error('Something went wrong');

      // Ensure loading animation plays for at least 1 second.
      const elapsed = Date.now() - loadingStartRef.current;
      const remaining = Math.max(0, 1000 - elapsed);
      await new Promise((resolve) => setTimeout(resolve, remaining));

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
            <div className="animate-fade-up py-0.5" style={{ animationDuration: '800ms' }}>
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
                      width="26"
                      height="12"
                      viewBox="0 0 26 12"
                      fill="none"
                      aria-hidden
                      style={{ display: 'block' }}
                    >
                      {/* Shaft */}
                      <line
                        x1="0"
                        y1="6"
                        x2="19"
                        y2="6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="butt"
                      />
                      {/* Arrowhead — sharp miter tip, flat ends */}
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
              </div>

              {/* Bouncing dots — fade in after the wipe completes */}
              {leaving && (
                <div
                  className="animate-fade-in absolute inset-0 flex items-center justify-center"
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
