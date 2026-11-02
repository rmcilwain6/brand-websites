'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

// Subpath imports keep the core package's Zod schemas out of the client bundle.
import { CAMPAIGN } from '@repo/core/campaigns';
import { REFERRAL } from '@repo/core/referrals';
import { formatVoucherDiscount } from '@repo/core/vouchers';

import { CopyLinkButton } from '../passion-projects/_components/share-button';
import { WALL } from '../passion-projects/wall';

type Props = {
  name: string;
  /** The booker entered a voucher code. No amount is shown: values vary and are checked by hand. */
  voucherEntered?: boolean;
};

// Two portrait frames from the wall, so these follow its photos.
const TALL_PHOTO = WALL[0]!;
const SHORT_PHOTO = WALL[2]!;

const frameCls = 'relative overflow-hidden border-[3px] border-surface bg-surface lg:border-[6px]';

/** A note from Reed in place of the usual confirmation, for a booking that's also an application. */
export const CampaignConfirmation = ({ name, voucherEntered = false }: Props) => {
  const firstName = name.trim().split(/\s+/)[0] ?? name;
  const panelRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // This replaces the much taller form, which leaves the viewport near the bottom of the page. Bring
  // the note into view and move focus to its heading so screen readers announce it.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    panelRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, []);

  return (
    <div
      ref={panelRef}
      className="grid w-full scroll-mt-6 gap-[18px] md:scroll-mt-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:content-center lg:gap-x-[72px] lg:gap-y-7"
    >
      <div className="flex flex-col gap-[18px] lg:gap-[22px]">
        <p className="font-mono text-[11px] uppercase leading-relaxed tracking-[0.12em] text-accent-text lg:tracking-[0.16em]">
          Passion Projects · Application received
        </p>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="font-campaign text-[40px] font-normal leading-[1.05] text-ink focus:outline-none lg:text-5xl lg:tracking-[-0.01em]"
        >
          {firstName}, thank you.
        </h2>
        <p className="font-campaign text-xl leading-[1.45] text-ink-muted lg:text-[22px]">
          Thanks for telling me what you&apos;re working on. {CAMPAIGN.copy.whatHappensNext}{' '}
          Features are chosen for variety, and I&apos;d love to photograph you either way.
        </p>
        {voucherEntered && (
          <p className="text-sm leading-relaxed text-ink-muted">
            Your voucher code will be confirmed by email.
          </p>
        )}
        <p className="font-campaign text-2xl italic leading-none text-ink lg:text-[26px]">Reed</p>
      </div>

      <div className="mt-1.5 grid grid-cols-[5fr_4fr] items-start gap-1.5 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:gap-3 lg:self-center">
        <div className={`${frameCls} h-[250px] lg:h-[420px]`}>
          <Image
            src={TALL_PHOTO.src}
            alt={TALL_PHOTO.alt}
            fill
            sizes="(min-width: 1024px) 230px, 55vw"
            className="object-cover"
          />
        </div>
        <div className={`${frameCls} mt-10 h-[180px] lg:mt-16 lg:h-[290px]`}>
          <Image
            src={SHORT_PHOTO.src}
            alt={SHORT_PHOTO.alt}
            fill
            sizes="(min-width: 1024px) 190px, 45vw"
            className="object-cover"
          />
        </div>
      </div>

      <div className="flex flex-col gap-[18px] lg:flex-row-reverse lg:items-center lg:justify-end lg:border-t lg:border-border lg:pt-[22px]">
        <p className="text-sm leading-normal text-ink-soft">
          Know someone else working on something? If they book, you get{' '}
          {formatVoucherDiscount(REFERRAL.discount)} off a session.
        </p>
        <CopyLinkButton
          label="Send someone my way"
          fallbackTo="refer"
          variant="solid"
          className="flex h-[52px] flex-none items-center justify-center rounded-card px-[22px] text-[15px] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:h-12"
        />
      </div>
    </div>
  );
};
