import { cn } from '../lib/cn';

type PlacardProps = {
  title: string;
  subtitle?: string;
  /** Small metadata label rendered above the title in muted all-caps */
  meta?: string;
  size?: 'sm' | 'md';
  className?: string;
};

/**
 * Placard — the brand's label card for titles, captions, and metadata.
 * Used consistently across gallery titles, photo captions, packages, process steps.
 */
export const Placard = ({ title, subtitle, meta, size = 'md', className }: PlacardProps) => {
  return (
    <div
      className={cn(
        'inline-block rounded-placard border border-border bg-surface shadow-warm-sm',
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
        <p className={cn('mt-0.5 text-ink-muted', size === 'sm' ? 'text-[10px]' : 'text-xs')}>
          {subtitle}
        </p>
      )}
    </div>
  );
};
