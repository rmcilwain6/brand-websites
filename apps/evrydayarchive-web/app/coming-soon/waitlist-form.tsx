'use client';

import { useRef, useState } from 'react';

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
  const arrowRef = useRef<SVGSVGElement>(null);
  const spinRef = useRef<Animation | null>(null);

  const startSpin = () => {
    const el = arrowRef.current;
    if (!el) return;
    spinRef.current = el.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], {
      duration: 700,
      iterations: Infinity,
      easing: 'linear'
    });
  };

  // After the API responds, find the current visual angle and animate to the
  // nearest pointing-left position (180°, 540°, …), decelerating to a stop.
  const settleSpin = (): Promise<void> =>
    new Promise((resolve) => {
      const spin = spinRef.current;
      const el = arrowRef.current;
      if (!spin || !el) {
        resolve();
        return;
      }

      // Read the current visual rotation from the computed matrix.
      const matrix = new DOMMatrix(getComputedStyle(el).transform);
      const raw = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
      const currentAngle = ((raw % 360) + 360) % 360;

      spin.cancel();

      // Find the next pointing-left angle (≡ 180 mod 360) at least 45° ahead
      // so the arrow never snaps or reverses.
      let target = 180;
      while (target < currentAngle + 45) target += 360;

      const settle = el.animate(
        [{ transform: `rotate(${currentAngle}deg)` }, { transform: `rotate(${target}deg)` }],
        { duration: 950, easing: 'cubic-bezier(0, 0.8, 0.1, 1)', fill: 'forwards' }
      );

      settle.onfinish = () => resolve();
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'loading') return;

    setStatus('loading');
    setErrorMsg('');
    startSpin();

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!res.ok) throw new Error('Something went wrong');

      // Fetch done — let the arrow decelerate and settle pointing left.
      await settleSpin();

      // Collapse the form from left to right, then swap in the success text.
      setLeaving(true);
      setTimeout(() => setStatus('success'), 380);
    } catch {
      spinRef.current?.cancel();
      setStatus('error');
      setErrorMsg('Something went wrong — please try again.');
    }
  };

  const isLoading = status === 'loading';

  return (
    <div className="max-w-xs">
      <form onSubmit={handleSubmit}>
        {/* Label — collapses left→right on submit */}
        {status !== 'success' && (
          <p
            className="mb-4 text-xs font-medium uppercase tracking-widest text-ink-faint"
            style={{
              clipPath: leaving ? 'inset(0 0 0 100%)' : 'inset(0 0 0 0%)',
              transition: 'clip-path 340ms ease-in'
            }}
          >
            Join the waitlist
          </p>
        )}

        <div className="flex items-center gap-3 border-b border-ink/35 pb-2">
          {/* Input / success text — swaps in the same space */}
          <div className="min-w-0 flex-1 overflow-hidden">
            {status !== 'success' ? (
              <div
                style={{
                  clipPath: leaving ? 'inset(0 0 0 100%)' : 'inset(0 0 0 0%)',
                  transition: 'clip-path 360ms ease-in'
                }}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={isLoading}
                  className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none disabled:opacity-50"
                />
              </div>
            ) : (
              // Grows out from the right — from where the arrow is pointing.
              <div
                className="animate-wipe-in-right overflow-hidden"
                style={{ animationDuration: '420ms' }}
              >
                <p className="mb-0.5 text-xs font-medium uppercase tracking-widest text-ink-faint">
                  You&apos;re in.
                </p>
                <p className="text-sm leading-snug text-ink-muted">
                  First through the door. We&apos;ll be in touch soon.
                </p>
              </div>
            )}
          </div>

          {/* Arrow — always present, never removed from the DOM */}
          <button
            type="submit"
            aria-label="Submit"
            className="shrink-0 text-accent transition-colors duration-fast hover:text-accent/70"
          >
            <svg
              ref={arrowRef}
              width="22"
              height="14"
              viewBox="0 0 22 14"
              fill="none"
              aria-hidden
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
          </button>
        </div>

        {status === 'error' && <p className="mt-2 text-[11px] text-red-500">{errorMsg}</p>}
      </form>

      <Disclaimer />
    </div>
  );
};
