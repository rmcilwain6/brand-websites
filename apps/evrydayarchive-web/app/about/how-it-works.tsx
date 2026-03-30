'use client';

import { useState } from 'react';

const STEPS = [
  "Start with a package. Pick one that feels close, we'll adjust from there.",
  "Show up as you are. No posing you into something that doesn't feel like you.",
  'Get your preview gallery. Browse what we made together.',
  'Choose what you want to keep. Add more if something catches your eye ($7/image).',
  'Receive your edited gallery. Yours to keep.'
];

export const HowItWorks = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-10">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="text-sm text-ink-muted underline-offset-2 transition-colors duration-fast hover:text-ink hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        {open ? 'Close' : 'How does a session work?'}
      </button>

      {open && (
        <div className="mt-6 animate-fade-up">
          <ol className="space-y-0">
            {STEPS.map((step, i) => (
              <li key={i}>
                <div className="flex items-start gap-3 py-2">
                  <span className="mt-0.5 w-4 flex-none font-mono text-xs text-ink-faint">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-ink-muted">{step}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="ml-[7px]">
                    <span className="block h-1.5 w-1.5 rounded-full bg-accent/50" />
                  </div>
                )}
              </li>
            ))}
          </ol>
          <p className="mt-5 text-xs text-ink-faint">
            Pricing is on the site. No surprises, no hidden fees.
          </p>
        </div>
      )}
    </div>
  );
};
