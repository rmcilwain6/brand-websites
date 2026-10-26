// Shared styling and error display for booking form fields.

export const inputCls = (hasError = false) =>
  [
    'w-full rounded-card border bg-canvas px-4 py-3 text-sm text-ink',
    'placeholder:text-ink-faint transition-colors duration-fast focus:outline-none',
    hasError ? 'border-red-300 focus:border-red-400' : 'border-border focus:border-ink-muted'
  ].join(' ');

/** A pill-shaped option: a visually hidden radio inside a styled label. */
export const chipCls = (checked: boolean) =>
  [
    'cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors duration-fast',
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

export const FieldError = ({ id, message }: { id: string; message: string | undefined }) => {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="flex items-center gap-1 text-xs text-red-600">
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
