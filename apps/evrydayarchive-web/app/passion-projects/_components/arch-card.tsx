import Image from 'next/image';
import Link from 'next/link';

import { featureLabel } from './feature-label';

type Props = {
  image: { src: string; alt: string };
  /** The feature's number, shown as "Feature 01". */
  number: number;
  name: string;
  oneLiner: string;
  href: string;
  /** How wide the card is at each breakpoint, for picking the image size. */
  sizes?: string;
};

/**
 * A feature, as a card. The arch comes from the logo's sun and means "feature": it's reserved for
 * these cards, so don't use it for other photos. The card fills its parent's width.
 */
export const ArchCard = ({
  image,
  number,
  name,
  oneLiner,
  href,
  sizes = '(min-width: 1024px) 256px, 208px'
}: Props) => (
  <Link
    href={href}
    className="group flex flex-col text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
  >
    <span className="relative block aspect-[64/85] overflow-hidden rounded-t-full">
      <Image src={image.src} alt={image.alt} fill sizes={sizes} className="object-cover" />
    </span>
    <span aria-hidden="true" className="h-1 bg-accent lg:h-[5px]" />
    <span className="mt-3.5 font-mono text-[11px] uppercase tracking-[0.16em] text-accent-text">
      {featureLabel(number)}
    </span>
    <span className="mt-1.5 font-campaign text-[22px] leading-[1.12] underline-offset-4 group-hover:underline lg:text-[26px]">
      {name}
    </span>
    <span className="mt-1.5 text-sm leading-normal text-ink-soft">{oneLiner}</span>
  </Link>
);
