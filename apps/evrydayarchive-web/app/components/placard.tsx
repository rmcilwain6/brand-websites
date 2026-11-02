import { cn } from '../lib/cn';

type PlacardProps = {
  title: string;
  subtitle?: string;
  /** Small metadata label rendered above the title in muted all-caps */
  meta?: string;
  size?: 'sm' | 'md';
  /** Sets the subtitle as a catalogue line in mono caps, e.g. "Kamloops · 2026". */
  monoSubtitle?: boolean;
  className?: string;
};

/**
 * Placard — the brand's label card for titles, captions, and metadata.
 * Styled like a real gallery label: sharp corners, clean border, no shadow.
 */
export const Placard = ({
  title,
  subtitle,
  meta,
  size = 'md',
  monoSubtitle = false,
  className
}: PlacardProps) => {
  return (
    <div
      className={cn(
        'inline-block border border-border bg-surface',
        size === 'sm' ? 'px-2.5 py-1.5' : 'px-3 py-2.5',
        className
      )}
    >
      {meta && (
        <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-ink-faint">
          {meta}
        </p>
      )}
      <p className={cn('font-medium leading-snug text-ink', size === 'sm' ? 'text-xs' : 'text-sm')}>
        {title}
      </p>
      {subtitle && (
        <p
          className={cn(
            'mt-0.5',
            monoSubtitle
              ? 'font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink-soft'
              : cn('text-ink-muted', size === 'sm' ? 'text-[10px]' : 'text-xs')
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};
