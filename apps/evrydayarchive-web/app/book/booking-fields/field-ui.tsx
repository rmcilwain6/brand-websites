// Shared styling and error display for booking form fields.

export const inputCls = (hasError = false) =>
  [
    'w-full rounded-card border bg-canvas px-4 py-3 text-sm text-ink',
    'placeholder:text-ink-faint transition-colors duration-fast focus:outline-none',
    hasError ? 'border-red-300 focus:border-red-400' : 'border-border focus:border-ink-muted'
  ].join(' ');

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
