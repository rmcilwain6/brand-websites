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
  // Phase 1: spin-up (ease-in, slow→fast)
  const spinUpRef = useRef<Animation | null>(null);
  // Phase 2: cruise (continuous linear at cruise speed)
  const spinCruiseRef = useRef<Animation | null>(null);
  // Guard against overlapping easter egg taps
  const easterEggActiveRef = useRef(false);

  // ── Spin management ────────────────────────────────────────────────────────

  const startSpin = () => {
    const el = arrowRef.current;
    if (!el) return;

    // Spin-up: 0→360° ease-in over 700ms. Ends at exactly 360° (≡ 0°) so the
    // cruise loop starts without any visual snap.
    const spinUp = el.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], {
      duration: 700,
      easing: 'ease-in'
    });
    spinUpRef.current = spinUp;

    spinUp.onfinish = () => {
      // If settleSpin already cancelled spin-up, don't start cruise.
      if (spinUpRef.current !== spinUp) return;
      spinUpRef.current = null;

      spinCruiseRef.current = el.animate(
        [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
        // 350ms/revolution matches the exit velocity of the ease-in spin-up.
        { duration: 350, iterations: Infinity, easing: 'linear' }
      );
    };
  };

  // Called once the API responds. Reads the live angle, cancels whichever
  // spin phase is active, then decelerates the arrow to point ←.
  const settleSpin = (): Promise<void> =>
    new Promise((resolve) => {
      const el = arrowRef.current;

      // Cancel whichever phase is currently running.
      if (spinCruiseRef.current) {
        spinCruiseRef.current.cancel();
        spinCruiseRef.current = null;
      }
      if (spinUpRef.current) {
        spinUpRef.current.cancel();
        spinUpRef.current = null; // signals onfinish callback to skip cruise start
      }

      if (!el) {
        resolve();
        return;
      }

      // Read the current visual rotation from the live computed matrix.
      const matrix = new DOMMatrix(getComputedStyle(el).transform);
      const rawDeg = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
      const currentAngle = ((rawDeg % 360) + 360) % 360;

      // Find the nearest pointing-← angle (180°, 540°, …) at least 45° ahead
      // so the arrow never reverses or snaps backwards.
      let target = 180;
      while (target < currentAngle + 45) target += 360;

      const settle = el.animate(
        [{ transform: `rotate(${currentAngle}deg)` }, { transform: `rotate(${target}deg)` }],
        // Starts fast (matching cruise speed), decelerates like a wheel losing friction.
        { duration: 950, easing: 'cubic-bezier(0.05, 1, 0.1, 1)', fill: 'forwards' }
      );

      settle.onfinish = () => {
        // Commit the final position as an inline style so it persists after
        // the animation is cancelled, enabling the easter egg to read it cleanly.
        settle.commitStyles();
        settle.cancel();
        resolve();
      };
    });

  // ── Easter egg ─────────────────────────────────────────────────────────────

  // Clicking the arrow after a successful submit triggers one bonus spin —
  // no API call, no state change, just the wheel doing its thing.
  const triggerEasterEgg = () => {
    if (easterEggActiveRef.current) return;
    const el = arrowRef.current;
    if (!el) return;

    easterEggActiveRef.current = true;

    // Read the committed inline angle (will be ≈ 180° pointing ←).
    const matrix = new DOMMatrix(el.style.transform || 'none');
    const rawDeg = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
    const currentAngle = ((rawDeg % 360) + 360) % 360;

    const spin = el.animate(
      [
        { transform: `rotate(${currentAngle}deg)` },
        { transform: `rotate(${currentAngle + 360}deg)` }
      ],
      { duration: 700, easing: 'ease-in-out', fill: 'forwards' }
    );

    spin.onfinish = () => {
      spin.commitStyles();
      spin.cancel();
      easterEggActiveRef.current = false;
    };
  };

  // ── Form submission ─────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // After success the arrow becomes a pure easter egg trigger.
    if (status === 'success') {
      triggerEasterEgg();
      return;
    }

    if (status === 'loading') return;

    setStatus('loading');
    setErrorMsg('');

    // Collapse the input immediately — the trigger that kicks the wheel.
    setLeaving(true);
    startSpin();

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!res.ok) throw new Error('Something went wrong');

      // API responded — bring the wheel to a stop.
      await settleSpin();
      setStatus('success');
    } catch {
      // Clean up spin state and restore the form.
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
          {/* Input / success text — occupies the same space */}
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
              // Grows out from the right — from where the arrow is pointing.
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

          {/* Arrow — always present, becomes an easter egg after success */}
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
