'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import type { LocationWindow, PublicPackage, TimeSlot } from '@repo/core';
// Subpath import keeps the core package's Zod schemas out of the client bundle.
import { CAMPAIGN, isCampaignEligible } from '@repo/core/campaigns';

import { BookingForm } from '../../book/booking-form';
import { cn } from '../../lib/cn';
import { ModifierRow, formatPrice } from '../../package-builder/builder-card';
import { hasEdits } from '../../package-builder/builder-state';
import { usePackageBuilder } from '../../package-builder/use-package-builder';
import {
  MATCH_REASONS,
  activeSlug,
  applyHref,
  matchedSlug,
  parseAnswers,
  type ApplyAnswers,
  type People,
  type ProjectType
} from '../apply-routing';
import { SectionHeading } from './section-heading';

type Props = {
  packages: PublicPackage[];
  timeSlots: TimeSlot[];
  locationWindows: LocationWindow[];
};

const QUESTIONS = [
  {
    id: 'type',
    label: 'Personal project or a business?',
    options: [
      { value: 'personal', label: 'Personal' },
      { value: 'business', label: 'Business' }
    ]
  },
  {
    id: 'people',
    label: 'Just you, or others involved?',
    options: [
      { value: 'solo', label: 'Just me' },
      { value: 'group', label: 'Others too' }
    ]
  }
] as const;

const focusCls =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

/** The questions, then the matched package and its builder with the booking steps below it. */
const Flow = ({
  eligible,
  timeSlots,
  locationWindows
}: {
  eligible: PublicPackage[];
  timeSlots: TimeSlot[];
  locationWindows: LocationWindow[];
}) => {
  const params = useSearchParams();
  const answers = parseAnswers(params);
  const available = eligible.map((p) => p.slug);
  const slug = activeSlug(answers, available);
  const activePkg = eligible.find((p) => p.slug === slug);

  // Seeded with the first package while there's no match, and not shown until there is one.
  const builder = usePackageBuilder(activePkg ?? eligible[0]!);
  const [note, setNote] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Stays true once there's been a match, so going back to fewer answers doesn't lose the form.
  const [started, setStarted] = useState(!!activePkg);

  // Follows the URL, including back and forward. Unchanged package, unchanged choices. Done while
  // rendering, not in an effect: there's never a render with the old package and the new answers.
  const { pkg, modifierSelection, reset } = builder;
  if (activePkg && activePkg.id !== pkg.id) {
    setNote(
      hasEdits(pkg, modifierSelection)
        ? `Your package changed to ${activePkg.name}, so its options are back to the defaults.`
        : null
    );
    reset(activePkg);
  }
  if (activePkg && !started) setStarted(true);

  // A shared link with answers lands on the flow rather than the top of the page. A refresh has
  // already restored its scroll position by now, so it's left alone.
  useEffect(() => {
    if (!slug || window.location.hash || window.scrollY > 0) return;
    document.getElementById('apply')?.scrollIntoView();
    // Only on arrival: answering later shouldn't move the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Adds to history, so back undoes an answer. Next keeps useSearchParams in step with this. */
  const go = (next: ApplyAnswers) => {
    const href = applyHref(next);
    if (href !== `${window.location.pathname}${window.location.search}`) {
      window.history.pushState(null, '', href);
    }
  };

  const answer = (id: 'type' | 'people', value: ProjectType | People) =>
    // A new answer goes back to following the answers, over a package picked earlier.
    go({ ...answers, [id]: value, package: undefined });

  const reason = pkg.slug === matchedSlug(answers) ? MATCH_REASONS[pkg.slug] : pkg.description;

  return (
    <div className="flex flex-col gap-[22px] lg:gap-14">
      {!submitted && (
        <div className="grid gap-[22px] lg:grid-cols-[300px_1fr] lg:items-start lg:gap-16">
          <SectionHeading
            eyebrow="Apply"
            description="Two quick questions pick the right package. You can change either answer and the builder follows."
          >
            Tell me a little about it
          </SectionHeading>

          <div className="grid gap-[22px] sm:grid-cols-2 lg:gap-8">
            {QUESTIONS.map(({ id, label, options }) => (
              <div
                key={id}
                role="group"
                aria-labelledby={`apply-${id}`}
                className="flex flex-col gap-3"
              >
                <p
                  id={`apply-${id}`}
                  className="font-campaign text-[22px] leading-[1.15] text-ink lg:text-2xl"
                >
                  {label}
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {options.map(({ value, label: optionLabel }) => {
                    const on = answers[id] === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={on}
                        onClick={() => answer(id, value)}
                        className={cn(
                          'min-h-[52px] rounded-card text-[15px] text-ink transition-colors duration-fast lg:min-h-14',
                          focusCls,
                          on
                            ? 'border-[1.5px] border-ink bg-surface font-semibold'
                            : 'border border-border font-medium hover:border-ink-muted'
                        )}
                      >
                        {optionLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {started && (
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-10">
          <BookingForm
            embedded
            campaignAvailable
            initialApply
            selection={builder.selection}
            timeSlots={timeSlots}
            locationWindows={locationWindows}
            onSubmitted={() => setSubmitted(true)}
            before={
              <div className="mb-3.5 rounded-card border border-border bg-surface">
                <div className="flex flex-col gap-[18px] px-[18px] pb-5 pt-5 lg:gap-[22px] lg:px-7 lg:pt-7">
                  <div className="flex flex-col gap-[18px] sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
                      Your package
                    </span>
                    <div className="grid grid-cols-3 gap-1.5 sm:flex sm:gap-2">
                      {eligible.map((p) => {
                        const on = p.id === pkg.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            aria-pressed={on}
                            onClick={() => go({ ...answers, package: p.slug })}
                            className={cn(
                              'min-h-11 rounded-card border px-1.5 text-[13px] font-medium transition-colors duration-fast sm:px-4 sm:text-sm',
                              focusCls,
                              on
                                ? 'border-ink bg-ink text-canvas'
                                : 'border-border text-ink hover:border-ink-muted'
                            )}
                          >
                            {p.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between gap-6">
                    <h3 className="font-campaign text-[34px] font-normal leading-none text-ink lg:text-[44px]">
                      {pkg.name}
                    </h3>
                    {pkg.basePriceCents != null && (
                      <span className="text-[15px] text-ink-soft">
                        Base price{' '}
                        <b className="font-semibold text-ink">{formatPrice(pkg.basePriceCents)}</b>
                      </span>
                    )}
                  </div>

                  {reason && (
                    <p className="bg-sun px-3.5 py-3 text-sm leading-[1.55] text-ink-muted lg:px-4 lg:py-3.5 lg:text-[15px]">
                      {reason}
                    </p>
                  )}

                  {note && (
                    <p role="status" className="text-sm leading-[1.55] text-accent-text">
                      {note}
                    </p>
                  )}
                </div>

                {builder.items.length > 0 && (
                  <div className="mt-1 divide-y divide-border border-y border-border [&>div]:px-[18px] lg:[&>div]:px-7">
                    {builder.items.map((item) => (
                      <ModifierRow
                        key={item.id}
                        item={item}
                        allItems={builder.items}
                        onChange={(id, next) => {
                          setNote(null);
                          builder.updateControl(id, next);
                        }}
                      />
                    ))}
                  </div>
                )}

                <div className="flex items-baseline justify-between px-[18px] py-5 lg:px-7">
                  <span className="text-sm text-ink lg:text-[15px]">Estimated total</span>
                  <span className="text-[26px] font-semibold text-ink lg:text-[32px]">
                    {formatPrice(builder.breakdown.totalCents)}
                  </span>
                </div>
              </div>
            }
          />
        </div>
      )}
    </div>
  );
};

/** The landing page's way to apply: the two questions, the builder and the booking steps. */
export const ApplyFlow = ({ packages, timeSlots, locationWindows }: Props) => {
  // In the campaign's order, so the tabs read from the smallest package up.
  const eligible = CAMPAIGN.eligibleSlugs.flatMap((slug) =>
    packages.filter((p) => p.slug === slug && isCampaignEligible(p.slug))
  );

  return (
    <section id="apply" className="scroll-mt-24 px-6 pt-16 lg:px-0 lg:pt-[120px]">
      {eligible.length > 0 ? (
        <Flow eligible={eligible} timeSlots={timeSlots} locationWindows={locationWindows} />
      ) : (
        <div className="flex flex-col gap-4">
          <SectionHeading eyebrow="Apply">Tell me a little about it</SectionHeading>
          <p className="text-base leading-relaxed text-ink-muted">
            The form isn&apos;t loading right now.{' '}
            <Link href="/contact" className="text-accent-text underline underline-offset-2">
              Get in touch
            </Link>{' '}
            and I&apos;ll take your application directly.
          </p>
        </div>
      )}
    </section>
  );
};
