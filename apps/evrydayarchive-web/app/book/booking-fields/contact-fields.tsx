'use client';

import { FieldError, inputCls } from './field-ui';

export type ContactValues = { name: string; email: string; phone: string };
type ContactField = keyof ContactValues;

type Props = {
  values: ContactValues;
  onChange: (field: ContactField, value: string) => void;
  errors: Partial<Record<ContactField, string>>;
};

export const ContactFields = ({ values, onChange, errors }: Props) => (
  <fieldset className="space-y-5">
    <legend className="text-sm font-semibold text-ink">Your details</legend>

    {/* Name */}
    <div className="flex flex-col gap-1.5">
      <label htmlFor="name" className="text-sm font-medium text-ink-muted">
        Full name{' '}
        <span className="text-accent" aria-hidden="true">
          *
        </span>
      </label>
      <input
        id="name"
        type="text"
        autoComplete="name"
        placeholder="Jane Smith"
        value={values.name}
        onChange={(e) => onChange('name', e.target.value)}
        aria-invalid={!!errors.name}
        aria-describedby={errors.name ? 'name-error' : undefined}
        className={inputCls(!!errors.name)}
      />
      <FieldError id="name-error" message={errors.name} />
    </div>

    {/* Email */}
    <div className="flex flex-col gap-1.5">
      <label htmlFor="email" className="text-sm font-medium text-ink-muted">
        Email{' '}
        <span className="text-accent" aria-hidden="true">
          *
        </span>
      </label>
      <input
        id="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={values.email}
        onChange={(e) => onChange('email', e.target.value)}
        aria-invalid={!!errors.email}
        aria-describedby={errors.email ? 'email-error' : undefined}
        className={inputCls(!!errors.email)}
      />
      <FieldError id="email-error" message={errors.email} />
    </div>

    {/* Phone */}
    <div className="flex flex-col gap-1.5">
      <label htmlFor="phone" className="text-sm font-medium text-ink-muted">
        Phone <span className="text-xs font-normal text-ink-faint">(optional)</span>
      </label>
      <input
        id="phone"
        type="tel"
        autoComplete="tel"
        placeholder="+1 (613) 555-0100"
        value={values.phone}
        onChange={(e) => onChange('phone', e.target.value)}
        aria-invalid={!!errors.phone}
        aria-describedby={errors.phone ? 'phone-error' : undefined}
        className={inputCls(!!errors.phone)}
      />
      <FieldError id="phone-error" message={errors.phone} />
    </div>
  </fieldset>
);
