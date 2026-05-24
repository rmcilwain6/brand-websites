'use client';

import { useState } from 'react';

import { cn } from '../lib/cn';

const FAQ_ITEMS = [
  {
    question: 'What kinds of sessions do you do?',
    answer: (
      <>
        <p>
          Photography has been a part of my life for as long as I can remember, and my artistic
          practice has always been about doing as much as possible rather than narrowing in on one
          thing. That carries over into Evryday Archive Co. If it&apos;s something you care about
          capturing, I want to be involved.
        </p>
        <p>
          That means portraits, couples, families, pets, events, sports, small businesses, products,
          and even more abstract or experimental work. I&apos;m here to help document what you love,
          and to help you flesh out ideas and visions in a collaborative way when you have something
          specific in mind.
        </p>
      </>
    )
  },
  {
    question: 'How far ahead should I book?',
    answer: (
      <p>
        It depends, and I&apos;m usually flexible enough to make last-minute sessions work. More
        lead time gives us more room to work out the details, but a shorter window isn&apos;t
        necessarily a problem.
        <br />
        <br />
        If there&apos;s travel involved, it&apos;s worth checking the calendar on the booking page
        to see where I&apos;ll be. I move between Kamloops, Vancouver, and Victoria regularly, so
        timing can sometimes line up more easily than you&apos;d expect.
      </p>
    )
  },
  {
    question: 'How does pricing work? How many photos will I get?',
    answer: (
      <>
        <p>
          Each package has a base image count included in the session price. You can find the full
          breakdown on the{' '}
          <a
            href="/packages"
            className="font-medium text-ink underline-offset-2 hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            Packages
          </a>{' '}
          page.
        </p>
        <p>
          After you receive your preview gallery, you can select fewer images than your package
          includes, or add more at $7 per image. Most clients end up adding a few after seeing the
          work. That&apos;s expected and built into how the process works.
        </p>
        <p>
          <strong className="font-medium text-ink">As It Unfolds</strong> (event coverage) works
          differently. Image delivery for events is based on session length and the variety of
          moments captured rather than a fixed count. The goal is wide coverage — candids, groups,
          environment, detail — rather than a curated set of portraits.
        </p>
      </>
    )
  },
  {
    question: "What's the payment process?",
    answer: (
      <p>
        A 50% deposit alongside a signed contract is required to guarantee your session date. The
        remaining balance is due after the shoot, before your final images are delivered.
        <br />
        <br />
        Payment can be made by e-transfer, cash, or cheque. Some exceptions to the payment structure
        can be made depending on timing and circumstances. Any additional images purchased after
        your preview gallery will be added to your remaining total.
      </p>
    )
  },
  {
    question: 'Do I need to sign a contract?',
    answer: (
      <p>
        Yes. The session agreement is there to make sure we&apos;re on the same page about the
        details before anything starts. It covers the scope of the shoot, what you&apos;ll receive,
        timelines, and usage of the images. It&apos;s something we can both reference if any
        questions come up, and it&apos;s standard for professional photography work. Nothing
        complicated, just clear expectations for both sides.
      </p>
    )
  },
  {
    question: "What's the cancellation policy?",
    answer: (
      <p>
        Cancellations made more than 48 hours before the scheduled session receive a full refund of
        the deposit, or the deposit can be applied to a rescheduled session. Cancellations within 48
        hours forfeit the deposit.
      </p>
    )
  },
  {
    question: 'Do you travel for sessions?',
    answer: (
      <p>
        Yes. I regularly travel between Kamloops, Vancouver, and Victoria for personal and
        professional reasons, so depending on where you are, there may be no additional travel cost
        at all. If you&apos;re in one of those locations, we can likely make something work without
        a travel fee. For anywhere outside of that, there may be additional costs depending on the
        location and timing. Reach out and we&apos;ll figure it out.
      </p>
    )
  },
  {
    question: 'What should we wear?',
    answer: (
      <p>
        I&apos;m a big believer in capturing life as it actually is, so I&apos;ll always recommend
        wearing clothes that make you feel like yourself. Whatever you want to be wearing in your
        photos is the first step in shaping the session. I&apos;m happy to lean into whatever
        direction you want to take things. If you&apos;d like suggestions, just ask.
      </p>
    )
  },
  {
    question: 'How long until we receive the photos?',
    answer: (
      <p>
        Your preview gallery will be ready within 5 days of the session. Once you&apos;ve made your
        final selections and your remaining balance has been received, the fully edited gallery is
        delivered within 7 to 10 days.
        <br />
        <br />
        For event sessions, the timeline is similar, though the delivery is a curated set rather
        than a selection-based gallery.
      </p>
    )
  },
  {
    question: 'Can we ask for specific shots?',
    answer: (
      <p>
        Please do. The clearer your vision and requests are, the easier it is to make sure you get
        what you&apos;re hoping for. I&apos;m always happy to improvise and go with the flow, but a
        shot list worked out ahead of time means we get everything we&apos;re after and then some.
      </p>
    )
  },
  {
    question: "What happens if the weather doesn't cooperate?",
    answer: (
      <p>
        That&apos;s always up to you. There can be something genuinely interesting about capturing
        moments in weather you didn&apos;t plan for — rain, fog, an overcast sky. If you want to
        push through, I&apos;m in. And if you&apos;d rather reschedule, we can do that with no
        penalty.
      </p>
    )
  },
  {
    question: "I don't see a package that fits my situation. Can I still reach out?",
    answer: (
      <p>
        Always. The listed packages are starting points. If anything, the unusual or specific
        circumstances are often the most interesting to work with. Send a message and we&apos;ll
        figure something out.
      </p>
    )
  }
];

export const FaqAccordion = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <dl className="divide-y divide-border">
      {FAQ_ITEMS.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div key={index}>
            <dt>
              <button
                type="button"
                onClick={() => toggle(index)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 py-5 text-left focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              >
                <span className="text-base font-medium text-ink">{item.question}</span>
                <ChevronIcon isOpen={isOpen} />
              </button>
            </dt>
            <dd
              className={cn(
                'overflow-hidden transition-all duration-standard',
                isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
              )}
              aria-hidden={!isOpen}
            >
              <div className="space-y-4 pb-5 text-base leading-relaxed text-ink-muted">
                {item.answer}
              </div>
            </dd>
          </div>
        );
      })}
    </dl>
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
