'use client';

import { useState } from 'react';

import { cn } from '../lib/cn';

const STEPS = [
  {
    number: '01',
    title: 'Reach out',
    summary: 'Send a message with a rough idea of what you have in mind.',
    detail: (
      <p>
        No formal brief needed. Just tell me the occasion, the people involved, and what feels
        important to you. If you&apos;re not sure which package fits, that&apos;s fine. We&apos;ll
        figure it out together. You can reach out through the inquiry form or by sending a DM on
        Instagram.
      </p>
    )
  },
  {
    number: '02',
    title: 'We get aligned',
    summary: 'A short conversation before anything is confirmed.',
    detail: (
      <>
        <p>
          For most sessions, this is a quick message exchange to clarify the date, location, and
          what you&apos;re hoping to walk away with. For In Practice sessions (small business and
          professional work), this includes a dedicated 60-minute alignment call over Zoom or in
          person. It&apos;s a chance to make sure I understand the purpose of the shoot and you know
          what to expect from the day.
        </p>
        <p>
          Once we&apos;re aligned, I&apos;ll send over a session agreement that outlines the
          details: date, deliverables, pricing, and image usage. A 50% deposit is required alongside
          the signed agreement to confirm your booking. The remainder is due after the shoot, before
          your final images are delivered.
        </p>
      </>
    )
  },
  {
    number: '03',
    title: 'The session',
    summary: 'We meet, we document. My job is to stay out of the way.',
    detail: (
      <>
        <p>
          Sessions are low-pressure by design. The ideal version is you doing what you love, or
          spending time with the people you love, in a way that feels normal. I get out of the way
          and quietly capture what&apos;s there.
        </p>
        <p>
          That said, I&apos;m always present and ready to jump in. I&apos;ll use the space and
          environment we&apos;re in to find interesting angles and compositions, and I&apos;ll
          direct and pose when it helps — the goal is just to make sure it never feels awkward.
          Keeping things moving and making the most of our time together is part of the job.
        </p>
      </>
    )
  },
  {
    number: '04',
    title: 'Preview gallery',
    summary: "Within 5 days, you'll receive a private gallery to review.",
    detail: (
      <>
        <p>
          After the session, I work through everything and build a lightly edited preview gallery.
          You&apos;ll receive a private link, usually within 5 days, and from there you select the
          images you want fully edited.
        </p>
        <p>
          Each package includes a set number of images. You can select fewer if you want, or add
          more at $7 per image. Take your time with the gallery.
        </p>
        <p>
          <strong className="font-medium text-ink">
            Exception — As It Unfolds (event coverage):
          </strong>{' '}
          Event sessions skip the preview gallery entirely. Instead, I deliver a curated final
          gallery based on the session length and the range of moments captured. The goal is wide
          coverage: group shots, candids, environment, and detail. There&apos;s no selection step.
        </p>
      </>
    )
  },
  {
    number: '05',
    title: 'Final delivery',
    summary: 'Final edited images delivered within 7 to 10 days of your selections.',
    detail: (
      <>
        <p>
          Once you&apos;ve made your selections and the remaining balance has been received, I get
          to work on the final edits. Every image in your gallery is edited with intention:
          consistent, clean, and honest to how the day looked and felt.
        </p>
        <p>
          Your finished gallery will be delivered as a private online gallery within 7 to 10 days.
          From there, it&apos;s yours. Download, print, share, keep. If you want help arranging
          prints or albums, I&apos;m happy to point you in the right direction.
        </p>
        <p>
          And if you come back for another session down the road, good. That&apos;s how this is
          supposed to work.
        </p>
      </>
    )
  }
];

export const ProcessAccordion = () => {
  const [openIndex, setOpenIndex] = useState<number>(0);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? -1 : index));
  };

  return (
    <ol className="divide-y divide-border">
      {STEPS.map((step, index) => {
        const isOpen = openIndex === index;

        return (
          <li key={step.number}>
            <button
              type="button"
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-5 py-5 text-left focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              <span className="w-7 flex-none text-xs font-medium tabular-nums text-ink-faint">
                {step.number}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-base font-medium text-ink">{step.title}</p>
                <p className="mt-0.5 text-sm text-ink-muted">{step.summary}</p>
              </div>
              <ChevronIcon isOpen={isOpen} />
            </button>
            <div
              className={cn(
                'overflow-hidden transition-all duration-standard',
                isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
              )}
              aria-hidden={!isOpen}
            >
              <div className="space-y-4 pb-6 pl-12 text-base leading-relaxed text-ink-muted">
                {step.detail}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
    className={cn(
      'flex-none text-ink-faint transition-transform duration-fast',
      isOpen && 'rotate-180'
    )}
  >
    <path
      d="M4 6l4 4 4-4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
