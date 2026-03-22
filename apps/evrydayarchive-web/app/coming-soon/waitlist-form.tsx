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
  const spinUpRef = useRef<Animation | null>(null);
  const spinCruiseRef = useRef<Animation | null>(null);
  const easterEggActiveRef = useRef(false);

  // ── Spin helpers ────────────────────────────────────────────────────────────

  // Reads the current visual angle from the element's computed transform matrix.
  const readAngle = (el: SVGSVGElement): number => {
    const matrix = new DOMMatrix(getComputedStyle(el).transform);
    const raw = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
    return ((raw % 360) + 360) % 360;
  };

  // Decelerates to the nearest pointing-← angle with at least `minExtraRotations`
  // full turns before stopping — so a fast API response still feels satisfying.
  const doSettle = (el: SVGSVGElement, minExtraRotations: number): Promise<void> =>
    new Promise((resolve) => {
      const currentAngle = readAngle(el);

      let target = 180;
      while (target < currentAngle + minExtraRotations * 360 + 45) target += 360;

      const settle = el.animate(
        [{ transform: `rotate(${currentAngle}deg)` }, { transform: `rotate(${target}deg)` }],
        // Starts fast (matching cruise speed), decelerates like a wheel losing friction.
        { duration: 1800, easing: 'cubic-bezier(0.05, 1, 0.1, 1)', fill: 'forwards' }
      );

      settle.onfinish = () => {
        // Commit so the final angle persists as an inline style for future reads.
        settle.commitStyles();
        settle.cancel();
        resolve();
      };
    });

  // Two-phase spin: ease-in ramp-up → seamless cruise at matching speed.
  // Spin-up: 0→720° in 600ms ease-in. Exit velocity ≈ 2 × (720/600) = 2.4°/ms = 150ms/rev,
  // which matches the cruise duration exactly — no perceptible speed bump at the handoff.
  const startSpin = () => {
    const el = arrowRef.current;
    if (!el) return;

    const spinUp = el.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(720deg)' }], {
      duration: 600,
      easing: 'ease-in'
    });
    spinUpRef.current = spinUp;

    spinUp.onfinish = () => {
      // Guard: if settleSpin already cancelled spin-up, skip starting cruise.
      if (spinUpRef.current !== spinUp) return;
      spinUpRef.current = null;

      spinCruiseRef.current = el.animate(
        [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
        { duration: 150, iterations: Infinity, easing: 'linear' }
      );
    };
  };

  // Cancel whatever spin phase is running, then decelerate to ← with at least
  // 3 extra rotations so it always feels like a proper spin-down.
  const settleSpin = async (): Promise<void> => {
    const el = arrowRef.current;

    spinCruiseRef.current?.cancel();
    spinCruiseRef.current = null;
    spinUpRef.current?.cancel();
    spinUpRef.current = null;

    if (!el) return;
    await doSettle(el, 3);
  };

  // ── Easter egg ──────────────────────────────────────────────────────────────

  const triggerEasterEgg = async () => {
    if (easterEggActiveRef.current) return;
    const el = arrowRef.current;
    if (!el) return;

    easterEggActiveRef.current = true;

    // Read the committed angle from the inline style left by the previous settle.
    const matrix = new DOMMatrix(el.style.transform || 'none');
    const raw = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
    const currentAngle = ((raw % 360) + 360) % 360;

    // Quick ramp-up from resting angle, then let it spin down naturally.
    const spinUp = el.animate(
      [
        { transform: `rotate(${currentAngle}deg)` },
        { transform: `rotate(${currentAngle + 720}deg)` }
      ],
      { duration: 600, easing: 'ease-in', fill: 'forwards' }
    );

    await new Promise<void>((resolve) => {
      spinUp.onfinish = () => resolve();
    });
    spinUp.commitStyles();
    spinUp.cancel();

    await doSettle(el, 3);
    easterEggActiveRef.current = false;
  };

  // ── Form submission ─────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (status === 'success') {
      triggerEasterEgg();
      return;
    }

    if (status === 'loading') return;

    setStatus('loading');
    setErrorMsg('');
    setLeaving(true);
    startSpin();

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!res.ok) throw new Error('Something went wrong');

      await settleSpin();
      setStatus('success');
    } catch {
      spinCruiseRef.current?.cancel();
      spinCruiseRef.current = null;
      spinUpRef.current?.cancel();
      spinUpRef.current = null;
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

        <div className="flex items-center gap-3 border-b border-ink/35 pb-2">
          {/* Input / success text — same slot */}
          <div className="min-w-0 flex-1 overflow-hidden">
            {status !== 'success' ? (
              <div
                style={{
                  clipPath: leaving ? 'inset(0 0 0 100%)' : 'inset(0 0 0 0%)',
                  transition: 'clip-path 250ms ease-in'
                }}
              >
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
            ) : (
              <div
                className="animate-wipe-in-right overflow-hidden"
                style={{ animationDuration: '420ms' }}
              >
                <p className="text-sm leading-snug text-ink-muted">
                  First through the door. We&apos;ll be in touch soon.
                </p>
              </div>
            )}
          </div>

          {/* Arrow — always present, easter egg after success */}
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
