import Image from 'next/image';

import type { Teaser } from '../teasers';
import { featureLabel } from './feature-label';

type Props = {
  teaser: Teaser;
  /** The feature's number, shown as "Feature 01". */
  number: number;
  /** How wide the arch is at each breakpoint, for picking the image size. */
  sizes: string;
};

/**
 * A feature that hasn't been unveiled: a frosted arch with a "Coming soon" sign, then the
 * feature's number and a question. Laid out like `ArchCard`, so the placeholder row looks like
 * the real one. The parent is the `.pp-teaser` hover target (see globals.css) and sets the width.
 */
export const TeaserArch = ({ teaser, number, sizes }: Props) => (
  <>
    <span className="pp-teaser-arch relative block aspect-[64/85] overflow-hidden rounded-t-full bg-mat-deep">
      {/* Decorative: the blur is the point, so there's nothing to describe. */}
      {teaser.src && <Image src={teaser.src} alt="" fill sizes={sizes} className="object-cover" />}
      <span className="pp-teaser-wash absolute inset-0" />
      <span className="absolute bottom-[18px] left-1/2 -translate-x-1/2">
        <span className="pp-teaser-sign block whitespace-nowrap bg-surface px-[9px] py-[5px] font-mono text-[10px] uppercase tracking-[0.14em] text-ink shadow-warm-sm">
          Coming soon
        </span>
      </span>
    </span>
    <span aria-hidden="true" className="h-1 bg-accent lg:h-[5px]" />
    <span className="mt-3.5 font-mono text-[11px] uppercase tracking-[0.16em] text-accent-text">
      {featureLabel(number)}
    </span>
    <span className="mt-1.5 font-campaign text-[22px] leading-[1.12] text-ink lg:text-[26px]">
      {teaser.name}
    </span>
  </>
);
