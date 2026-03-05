import { type ReactNode } from 'react';

import { cn } from '../lib/cn';

type FrameProps = {
  children: ReactNode;
  className?: string;
  /**
   * Optional slight rotation in degrees — creates the "object placed on paper"
   * gallery-wall feel. Typically -1.5 to 1.5.
   */
  rotateDeg?: number;
  /** Mat padding size around the photo */
  mat?: 'none' | 'sm' | 'md' | 'lg';
};

const matClass = {
  none: '',
  sm: 'p-2',
  md: 'p-3 sm:p-4',
  lg: 'p-5 sm:p-6'
};

/**
 * Frame — the brand's primary photo presentation component.
 * Wraps content in a surface-coloured mat with a warm shadow,
 * optionally rotated for an "exhibited object" feel.
 */
export const Frame = ({ children, className, rotateDeg, mat = 'md' }: FrameProps) => {
  return (
    <div
      className={cn('relative rounded-frame bg-surface shadow-frame', matClass[mat], className)}
      style={rotateDeg ? { transform: `rotate(${rotateDeg}deg)` } : undefined}
    >
      {children}
    </div>
  );
};
