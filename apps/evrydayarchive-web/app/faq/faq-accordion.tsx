'use client';

import { useState } from 'react';

import { cn } from '../lib/cn';

type FaqItem = {
  question: string;
  answer: string;
};

type FaqAccordionProps = {
  items: FaqItem[];
};

export const FaqAccordion = ({ items }: FaqAccordionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <dl className="divide-y divide-border">
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div key={index}>
            <dt>
              <button
                type="button"
                onClick={() => toggle(index)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 py-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:rounded-sm"
              >
                <span className="text-base font-medium text-ink">{item.question}</span>
                <ChevronIcon isOpen={isOpen} />
              </button>
            </dt>
            <dd
              className={cn(
                'overflow-hidden transition-all duration-standard',
                isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              )}
              aria-hidden={!isOpen}
            >
              <p className="pb-5 text-base leading-relaxed text-ink-muted">{item.answer}</p>
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
