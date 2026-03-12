import { type ReactNode } from 'react';

import { cn } from '../lib/cn';

export type FrameVariant = 'gallery' | 'craft';
export type MatStyle = 'neutral' | 'warm' | 'deep';

type FrameProps = {
  children: ReactNode;
  className?: string;
  /**
   * Visual variant:
   *  - 'gallery' (default) — sharp corners, thin border, defined shadow. Professional gallery look.
   *  - 'craft' — rounded corners, soft warm shadow, supports rotation. Exhibited-object feel.
   */
  variant?: FrameVariant;
  /** Mat background colour. Default: 'neutral' (white/surface). */
  matStyle?: MatStyle;
  /** Mat padding size around the photo */
  mat?: 'none' | 'sm' | 'md' | 'lg';
  /**
   * Optional rotation — craft variant only.
   * Typically -1.5 to 1.5 degrees for the "object placed on paper" feel.
   */
  rotateDeg?: number;
};

const matPaddingClass = {
  none: '',
  sm: 'p-2',
  md: 'p-3 sm:p-4',
  lg: 'p-5 sm:p-6'
};

const matBgClass: Record<MatStyle, string> = {
  neutral: 'bg-surface',
  warm: 'bg-sun',
  deep: 'bg-mat-deep'
};

const variantClass: Record<FrameVariant, string> = {
  gallery: 'rounded-frame-gallery border border-border shadow-frame-gallery',
  craft: 'rounded-frame shadow-frame'
};

export const Frame = ({
  children,
  className,
  variant = 'gallery',
  matStyle = 'neutral',
  mat = 'md',
  rotateDeg
}: FrameProps) => {
  return (
    <div
      className={cn(
        'relative',
        variantClass[variant],
        matBgClass[matStyle],
        matPaddingClass[mat],
        className
      )}
      style={
        variant === 'craft' && rotateDeg ? { transform: `rotate(${rotateDeg}deg)` } : undefined
      }
    >
      {children}
    </div>
  );
};
