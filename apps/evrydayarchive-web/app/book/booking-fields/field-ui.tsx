// Shared styling and error display for booking form fields.

export const inputCls = (hasError = false) =>
  [
    'w-full rounded-card border bg-canvas px-4 py-3 text-base text-ink',
    'placeholder:text-ink-faint transition-colors duration-fast focus:outline-none',
    hasError ? 'border-red-300 focus:border-red-400' : 'border-border focus:border-ink-muted'
  ].join(' ');

/** A pill-shaped option: a visually hidden radio inside a styled label. */
export const chipCls = (checked: boolean) =>
  [
    'cursor-pointer rounded-full border px-4 py-2 text-base transition-colors duration-fast',
    'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent',
    checked
      ? 'border-accent bg-accent font-medium text-white'
      : 'border-border bg-canvas text-ink-muted hover:border-ink-muted hover:text-ink'
  ].join(' ');

/**
 * A question that only appears because of an earlier answer. The indent and accent rule tie it
 * visually to the question above it.
 */
export const FollowUp = ({ children }: { children: React.ReactNode }) => (
  <div className="ml-3 flex animate-fade-in flex-col gap-1.5 border-l-2 border-accent/50 py-1 pl-4">
    {children}
  </div>
);

export const CheckIcon = () => (
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

/**
 * A native checkbox drawn by hand, because browsers choose the tick colour themselves and pick
 * black on the brand orange. The tick is the same one a finished booking step shows.
 */
export const Checkbox = (props: Omit<React.ComponentProps<'input'>, 'type' | 'className'>) => (
  <span className="relative mt-0.5 flex h-5 w-5 flex-none">
    <input
      {...props}
      type="checkbox"
      className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-ink-muted bg-canvas transition-colors duration-fast checked:border-accent checked:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    />
    <span className="pointer-events-none absolute inset-0 hidden items-center justify-center text-white peer-checked:flex">
      <CheckIcon />
    </span>
  </span>
);

export const FieldError = ({ id, message }: { id: string; message: string | undefined }) => {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="flex items-center gap-1 text-[13px] text-red-600">
      <ErrorIcon />
      {message}
    </p>
  );
};

const ErrorIcon = () => (
  <svg
    className="h-3 w-3 flex-none"
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.25" />
    <path d="M6 4v2.5M6 8h.01" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
  </svg>
);
