'use client';

import { cn } from '../lib/cn';

export type StepStatus = 'open' | 'done' | 'upcoming';

type Props = {
  /** Zero-based; shown as 1, 2, 3. */
  index: number;
  title: string;
  status: StepStatus;
  /** Shown under the title when the step is collapsed: the answers once done, otherwise a hint. */
  subtitle: string;
  optional?: boolean;
  /** Opens the step. Omitted for steps that can't be opened yet. */
  onOpen?: () => void;
  children: React.ReactNode;
};

export const stepHeadingId = (index: number) => `booking-step-${index}-heading`;

/**
 * One section of the checkout-style booking form. Only the open step shows its fields; the
 * others collapse to a header, with a summary and an Edit link once they're done.
 */
export const BookingStep = ({
  index,
  title,
  status,
  subtitle,
  optional,
  onOpen,
  children
}: Props) => {
  const open = status === 'open';
  const bodyId = `booking-step-${index}-body`;

  const header = (
    <>
      <span
        aria-hidden="true"
        className={cn(
          'flex h-8 w-8 flex-none items-center justify-center rounded-full text-sm font-semibold',
          open && 'border border-ink-muted bg-sun text-ink',
          status === 'done' && 'bg-accent text-white',
          status === 'upcoming' && 'border border-border text-ink-soft'
        )}
      >
        {status === 'done' ? <CheckIcon /> : index + 1}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={cn(
            'text-base font-semibold',
            open || status === 'done' ? 'text-ink' : 'text-ink-muted'
          )}
        >
          <span className="sr-only">Step {index + 1}: </span>
          {title}
          {optional && (
            <span className="ml-2 align-middle text-[13px] font-normal text-ink-soft">
              (optional)
            </span>
          )}
        </span>
        {!open && (
          <span
            className={cn(
              'truncate text-sm',
              status === 'done' ? 'text-ink-muted' : 'text-ink-soft'
            )}
          >
            {subtitle}
          </span>
        )}
      </span>
      {status === 'done' && (
        <span className="flex-none text-sm font-medium text-accent underline underline-offset-2">
          Edit
        </span>
      )}
    </>
  );

  const headerCls = 'flex w-full items-center gap-3.5 px-5 py-4 text-left sm:px-6';

  return (
    <section
      className={cn(
        'rounded-frame border border-border transition-colors duration-standard',
        // The open step takes the sand background of the "Your selection" card; the others stay clear.
        open ? 'bg-sun' : 'bg-transparent'
      )}
    >
      <h2 id={stepHeadingId(index)} tabIndex={-1} className="scroll-mt-24 outline-none">
        {onOpen && !open ? (
          <button
            type="button"
            onClick={onOpen}
            aria-expanded={false}
            aria-controls={bodyId}
            className={cn(
              headerCls,
              'rounded-frame focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent'
            )}
          >
            {header}
          </button>
        ) : (
          <div className={headerCls}>{header}</div>
        )}
      </h2>

      {open && (
        <div
          id={bodyId}
          className="animate-fade-in space-y-8 px-5 pb-6 pt-1 sm:pl-[4.375rem] sm:pr-6"
        >
          {children}
        </div>
      )}
    </section>
  );
};

const CheckIcon = () => (
  <svg className="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path
      d="M3 7.5l2.5 2.5L11 4.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
