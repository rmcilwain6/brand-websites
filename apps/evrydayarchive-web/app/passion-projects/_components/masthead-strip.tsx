import Link from 'next/link';

import { cn } from '../../lib/cn';

type Props = {
  /** The edition, e.g. "Winter 2026". */
  season: string;
  /**
   * Right-aligned label: a feature number or count at the top, places at the foot. Left off on
   * phones, where the edition takes the right-hand side instead.
   */
  right?: string;
  /** `header` opens a page and `footer` closes it. */
  as?: 'header' | 'footer';
  /** Makes the strip a link, e.g. from a feature back to the hall. */
  href?: string;
};

const monoCls = 'font-mono text-[11px] uppercase tracking-[0.16em]';

/**
 * The campaign's label strip. It scrolls with the page at every width and is never sticky, so on
 * desktop it sits directly under the sticky nav until the page moves.
 */
export const MastheadStrip = ({ season, right, as: Tag = 'header', href }: Props) => {
  const isHeader = Tag === 'header';

  const content = (
    <>
      <span className="font-campaign text-[22px] leading-none text-ink">Passion Projects</span>
      <span className={cn(monoCls, 'ml-auto text-ink-soft md:ml-0')}>{season}</span>
      {right && (
        <span
          className={cn(
            monoCls,
            'ml-auto hidden md:inline',
            isHeader ? 'text-accent-text' : 'text-ink-soft'
          )}
        >
          {right}
        </span>
      )}
    </>
  );

  // The colour runs full width. The contents line up with the page text on phones, where the nav is
  // at the bottom of the screen, and with the site header's logo and button from there up.
  const layoutCls = cn(
    'mx-auto flex max-w-7xl flex-wrap items-baseline gap-x-2.5 gap-y-1 px-6 sm:gap-x-3.5 lg:px-8',
    isHeader ? 'pb-3.5 pt-[18px] md:py-3.5' : 'py-5 lg:py-[22px]'
  );

  return (
    <Tag className={cn('border-accent bg-sun', isHeader ? 'border-b-2' : 'border-t-2')}>
      {href ? (
        <Link
          href={href}
          className={cn(
            layoutCls,
            'focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent'
          )}
        >
          {content}
        </Link>
      ) : (
        <div className={layoutCls}>{content}</div>
      )}
    </Tag>
  );
};
