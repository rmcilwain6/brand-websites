import type { Metadata } from 'next';

import {
  CAMPAIGN,
  fetchPublicAvailability,
  fetchPublicPackages,
  fetchPublicSchedule,
  type LocationWindow,
  type PublicPackage,
  type TimeSlot
} from '@repo/core';
import { REFERRAL } from '@repo/core/referrals';
import { formatVoucherDiscount } from '@repo/core/vouchers';

import { getServerEnv } from '../lib/env';
import { ApplyFlow } from './_components/apply-flow';
import { FeaturesRow } from './_components/features-row';
import { HowItWorks } from './_components/how-it-works';
import { MastheadStrip } from './_components/masthead-strip';
import { OrangeBand } from './_components/orange-band';
import { SalonWall } from './_components/salon-wall';
import { ShareButton } from './_components/share-button';
import { FEATURES, featureCountLabel } from './features';

const TITLE = 'Passion Projects | Evryday Archive Co';
const DESCRIPTION =
  'Somewhere close by, someone is putting years into a craft, a project, or a business they love. Who would you put in the spotlight?';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/passion-projects' },
  // Replaces the root layout's openGraph rather than merging with it, so it repeats the site fields.
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    siteName: 'Evryday Archive Co',
    title: TITLE,
    description: DESCRIPTION,
    url: '/passion-projects',
    // A placeholder until the dynamic OG image work.
    images: [{ url: '/logo/og-image.jpg', width: 1200, height: 630 }]
  }
};

export const dynamic = 'force-dynamic';

const PassionProjectsPage = async () => {
  const { ADMIN_API_BASE_URL } = getServerEnv();

  const rangeFrom = new Date().toISOString().split('T')[0]!;
  const rangeToDate = new Date();
  rangeToDate.setMonth(rangeToDate.getMonth() + 18);
  const rangeTo = rangeToDate.toISOString().split('T')[0]!;

  let packages: PublicPackage[] = [];
  let timeSlots: TimeSlot[] = [];
  let locationWindows: LocationWindow[] = [];

  await Promise.allSettled([
    fetchPublicPackages(ADMIN_API_BASE_URL, { next: { revalidate: 60 } }).then(
      (r) => (packages = r)
    ),
    fetchPublicAvailability(ADMIN_API_BASE_URL, { from: rangeFrom, to: rangeTo }).then(
      (r) => (timeSlots = r)
    ),
    fetchPublicSchedule(ADMIN_API_BASE_URL, { from: rangeFrom, to: rangeTo }).then(
      (r) => (locationWindows = r)
    )
  ]);

  const content = 'mx-auto w-full max-w-[1280px] lg:px-20';

  return (
    <main>
      <MastheadStrip season={CAMPAIGN.season} right={featureCountLabel(FEATURES.length)} />

      <div className={content}>
        <SalonWall />
        <FeaturesRow features={FEATURES} season={CAMPAIGN.season} />
        <HowItWorks />
      </div>

      <div className="mt-16 lg:mt-[110px]">
        <OrangeBand
          id="refer"
          heading={
            <>
              Somebody you know is <span className="block italic">working on something.</span>
            </>
          }
        >
          <p className="text-base font-medium leading-[1.55] lg:text-lg">
            Send them my way. If they book, you get {formatVoucherDiscount(REFERRAL.discount)} off a
            session, whether or not they&apos;re featured.
          </p>
          <ShareButton title="Passion Projects" />
        </OrangeBand>
      </div>

      <div className={content}>
        <ApplyFlow packages={packages} timeSlots={timeSlots} locationWindows={locationWindows} />
      </div>

      <div className="mt-[72px] lg:mt-[120px]">
        <MastheadStrip
          season={CAMPAIGN.season}
          right="Kamloops · Victoria · Vancouver"
          as="footer"
        />
      </div>
    </main>
  );
};

export default PassionProjectsPage;
