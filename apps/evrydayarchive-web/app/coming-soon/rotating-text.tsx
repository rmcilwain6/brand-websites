'use client';

import { useState, useEffect } from 'react';

const PHRASES = [
  "Most people wait for a reason to take photos. You don't need one.",
  "Photography for the life you're actually living.",
  'No occasion necessary.',
  'Not just the big moments. All of them.',
  'Sessions shaped around your life, not the other way around.'
];

export function RotatingText({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % PHRASES.length);
        setVisible(true);
      }, 500);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    // Default h-10 prevents layout shift on desktop (two lines max).
    // Pass className to override — e.g. on mobile where narrower width
    // means more wrapping and we want the text to fill vertical space.
    <div className={className ?? 'flex h-10 items-start overflow-hidden'}>
      <p
        className="text-sm leading-snug text-ink-muted transition-opacity duration-500"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {PHRASES[index]}
      </p>
    </div>
  );
}
