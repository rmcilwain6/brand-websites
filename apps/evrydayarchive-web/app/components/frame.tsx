import { type ReactNode } from 'react';

import { cn } from '../lib/cn';
import { Placard } from './placard';

export type FrameVariant = 'gallery' | 'craft';
export type MatStyle = 'neutral' | 'warm' | 'deep' | 'linen' | 'canvas';

export type PlacardPosition =
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'left-top'
  | 'left-middle'
  | 'left-bottom'
  | 'right-top'
  | 'right-middle'
  | 'right-bottom';

export const PLACARD_POS: Record<PlacardPosition, string> = {
  'bottom-left': 'mt-2 flex justify-start',
  'bottom-center': 'mt-2 flex justify-center',
  'bottom-right': 'mt-2 flex justify-end',
  'top-left': 'absolute bottom-full mb-2 left-0',
  'top-center': 'absolute bottom-full mb-2 left-1/2 -translate-x-1/2',
  'top-right': 'absolute bottom-full mb-2 right-0',
  'right-top': 'absolute left-full ml-5 top-0',
  'right-middle': 'absolute left-full ml-5 top-1/2 -translate-y-1/2',
  'right-bottom': 'absolute left-full ml-5 bottom-0',
  'left-top': 'absolute right-full mr-5 top-0',
  'left-middle': 'absolute right-full mr-5 top-1/2 -translate-y-1/2',
  'left-bottom': 'absolute right-full mr-5 bottom-0'
};

export type PlacardConfig = {
  title: string;
  subtitle?: string;
  meta?: string;
  size?: 'sm' | 'md';
  className?: string;
};

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
  /**
   * Optional placard attached to this frame. Rendered at the position specified
   * by `placardPosition`. When provided, the frame is wrapped in a `relative`
   * container so absolute positions anchor correctly.
   */
  placard?: PlacardConfig;
  /** Where the placard appears relative to the frame. Default: 'bottom-left'. */
  placardPosition?: PlacardPosition;
  /** Override the border colour. Applies to gallery variant only. */
  borderColor?: string;
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
  deep: 'bg-mat-deep',
  linen: 'bg-mat-linen',
  canvas: 'bg-canvas'
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
  rotateDeg,
  placard,
  placardPosition = 'bottom-left',
  borderColor
}: FrameProps) => {
  const frameEl = (
    <div
      className={cn(
        'relative',
        variantClass[variant],
        matBgClass[matStyle],
        matPaddingClass[mat],
        className
      )}
      style={{
        ...(variant === 'craft' && rotateDeg ? { transform: `rotate(${rotateDeg}deg)` } : {}),
        ...(borderColor ? { borderColor } : {})
      }}
    >
      {children}
    </div>
  );

  if (!placard) return frameEl;

  return (
    <div className="relative">
      {frameEl}
      <div className={PLACARD_POS[placardPosition]}>
        <Placard {...placard} />
      </div>
    </div>
  );
};
