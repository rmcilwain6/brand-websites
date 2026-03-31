'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';

import type {
  IncrementerConfig,
  PublicPackage,
  PublicPackageModifier,
  SliderConfig
} from '@repo/core';

import { DatePicker } from './date-picker';
import { TimePicker } from './time-picker';

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = {
  pkg: PublicPackage | null;
  resolvedModifiers: PublicPackageModifier[];
  modifierValues: Record<string, number>;
  estimatedTotalCents: number | undefined;
};

const modifierDisplayValue = (
  m: PublicPackageModifier,
  values: Record<string, number>
): string | null => {
  if (m.type === 'SLIDER') {
    const cfg = m.config as SliderConfig | null;
    if (!cfg) return null;
    return `${values[m.id] ?? cfg.defaultValue}${cfg.unit}`;
  }
  if (m.type === 'INCREMENTER') {
    const cfg = m.config as IncrementerConfig | null;
    if (!cfg) return null;
    const v = values[m.id] ?? cfg.defaultValue;
    return `${v}${cfg.unit ? ` ${cfg.unit}` : ''}`;
  }
  return null;
};

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

type FieldErrors = Partial<Record<'name' | 'email' | 'phone' | 'date', string>>;

// ── Validation helpers ────────────────────────────────────────────────────────

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

// Strip formatting; valid if 10–15 digits remain (covers NA + international)
const isValidPhone = (v: string) => {
  const digits = v.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
};

// ── Styling helpers ───────────────────────────────────────────────────────────

const inputCls = (hasError = false) =>
  [
    'w-full rounded-card border bg-canvas px-4 py-3 text-sm text-ink',
    'placeholder:text-ink-faint transition-colors duration-fast focus:outline-none',
    hasError ? 'border-red-300 focus:border-red-400' : 'border-border focus:border-ink-muted'
  ].join(' ');

const formatPrice = (cents: number): string =>
  new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0
  }).format(cents / 100);

// ── Field error message ───────────────────────────────────────────────────────

const FieldError = ({ id, message }: { id: string; message: string | undefined }) => {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="flex items-center gap-1 text-xs text-red-600">
      <ErrorIcon />
      {message}
    </p>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

export const BookingForm = ({
  pkg,
  resolvedModifiers,
  modifierValues,
  estimatedTotalCents
}: Props) => {
  const [status, setStatus] = useState<FormStatus>('idle');
  const [serverError, setServerError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submittedName, setSubmittedName] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [notes, setNotes] = useState('');

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().split('T')[0] as string;

  // ── Validation ──────────────────────────────────────────────────────────────

  const validate = (): FieldErrors => {
    const errs: FieldErrors = {};

    if (!name.trim()) {
      errs.name = 'Please enter your name.';
    } else if (name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters.';
    }

    if (!email.trim()) {
      errs.email = 'Please enter your email address.';
    } else if (!isValidEmail(email)) {
      errs.email = "That doesn't look like a valid email address.";
    }

    if (phone.trim() && !isValidPhone(phone)) {
      errs.phone = 'Please enter a valid phone number, or leave this blank.';
    }

    if (!preferredDate) {
      errs.date = 'Please choose a preferred date.';
    }

    return errs;
  };

  const clearError = (field: keyof FieldErrors) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError('');

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      // Focus the first invalid field
      if (errs.name) nameRef.current?.focus();
      else if (errs.email) emailRef.current?.focus();
      else if (errs.phone) phoneRef.current?.focus();
      return;
    }

    setStatus('submitting');

    const payload = {
      name,
      email,
      phone: phone || undefined,
      preferredDate,
      preferredTime: preferredTime || undefined,
      notes: notes || undefined,
      packageId: pkg?.id,
      packageName: pkg?.name,
      modifierIds: resolvedModifiers.filter((m) => !m.isRequired).map((m) => m.id),
      modifierValues: Object.keys(modifierValues).length > 0 ? modifierValues : undefined,
      estimatedTotalCents
    };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg = body?.error?.message ?? 'Something went wrong. Please try again.';
        setServerError(msg);
        setStatus('error');
        return;
      }

      setSubmittedName(name);
      setStatus('success');
    } catch {
      setServerError('Unable to reach the server. Please check your connection and try again.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return <ConfirmationPanel name={submittedName} />;
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-10">
      {/* Mobile-only package summary — desktop has a sidebar */}
      {pkg && (
        <div className="rounded-card border border-border bg-sun px-5 py-5 lg:hidden">
          <p className="mb-1 text-xs font-medium uppercase tracking-widest text-ink-faint">
            Your selection
          </p>
          <p className="text-base font-semibold text-ink">{pkg.name}</p>
          {resolvedModifiers.length > 0 && (
            <ul className="mt-2 space-y-1">
              {resolvedModifiers.map((m) => {
                const displayVal = modifierDisplayValue(m, modifierValues);
                return (
                  <li key={m.id} className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-ink-muted">
                      {m.name}
                      {displayVal && (
                        <span className="ml-1 text-xs text-ink-faint">({displayVal})</span>
                      )}
                      {m.isRequired && !displayVal && (
                        <span className="ml-1 text-xs text-ink-faint">(included)</span>
                      )}
                    </span>
                    {m.priceDeltaCents != null && !m.isRequired && (
                      <span className="flex-none text-xs tabular-nums text-ink-faint">
                        +{formatPrice(m.priceDeltaCents)}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {estimatedTotalCents != null && (
            <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
              <span className="text-xs text-ink-faint">Estimated total</span>
              <span className="text-sm font-semibold text-ink">
                {formatPrice(estimatedTotalCents)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Date + time */}
      <fieldset className="space-y-5">
        <legend className="text-sm font-semibold text-ink">Preferred date &amp; time</legend>
        <p className="text-xs leading-relaxed text-ink-faint">
          This is a preference, not a confirmed slot. I&apos;ll reach out to confirm availability.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="preferred-date" className="text-sm font-medium text-ink-muted">
              Date{' '}
              <span className="text-accent" aria-hidden="true">
                *
              </span>
            </label>
            <DatePicker
              id="preferred-date"
              value={preferredDate}
              onChange={(v) => {
                setPreferredDate(v);
                clearError('date');
              }}
              min={today}
              placeholder="Choose a date"
              hasError={!!fieldErrors.date}
              aria-describedby={fieldErrors.date ? 'date-error' : undefined}
            />
            <FieldError id="date-error" message={fieldErrors.date} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="preferred-time" className="text-sm font-medium text-ink-muted">
              Preferred time <span className="text-xs font-normal text-ink-faint">(optional)</span>
            </label>
            <TimePicker id="preferred-time" value={preferredTime} onChange={setPreferredTime} />
          </div>
        </div>
      </fieldset>

      {/* Contact details */}
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
            ref={nameRef}
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Jane Smith"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              clearError('name');
            }}
            aria-invalid={!!fieldErrors.name}
            aria-describedby={fieldErrors.name ? 'name-error' : undefined}
            className={inputCls(!!fieldErrors.name)}
          />
          <FieldError id="name-error" message={fieldErrors.name} />
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
            ref={emailRef}
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearError('email');
            }}
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            className={inputCls(!!fieldErrors.email)}
          />
          <FieldError id="email-error" message={fieldErrors.email} />
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className="text-sm font-medium text-ink-muted">
            Phone <span className="text-xs font-normal text-ink-faint">(optional)</span>
          </label>
          <input
            ref={phoneRef}
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+1 (613) 555-0100"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              clearError('phone');
            }}
            aria-invalid={!!fieldErrors.phone}
            aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
            className={inputCls(!!fieldErrors.phone)}
          />
          <FieldError id="phone-error" message={fieldErrors.phone} />
        </div>
      </fieldset>

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className="text-sm font-medium text-ink-muted">
          Anything else I should know?{' '}
          <span className="text-xs font-normal text-ink-faint">(optional)</span>
        </label>
        <textarea
          id="notes"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Location ideas, vision, special requests…"
          className={`${inputCls()} resize-none`}
        />
      </div>

      {/* Server error */}
      {status === 'error' && (
        <p
          role="alert"
          className="rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {serverError}
        </p>
      )}

      {/* Submit */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="rounded-card bg-accent px-8 py-3.5 text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          {status === 'submitting' ? 'Sending…' : 'Send request'}
        </button>
        <p className="text-xs leading-relaxed text-ink-faint">
          No commitment. I&apos;ll be in touch soon.
        </p>
      </div>
    </form>
  );
};

// ── Confirmation panel ────────────────────────────────────────────────────────

const ConfirmationPanel = ({ name }: { name: string }) => {
  const firstName = name.split(' ')[0] ?? name;

  return (
    <div className="rounded-card border border-border bg-sun px-8 py-14 text-center">
      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-ink-faint">
        Request sent
      </p>
      <h2 className="mb-4 text-2xl font-semibold text-ink">You&apos;re all set, {firstName}.</h2>
      <p className="mx-auto mb-10 max-w-sm text-base leading-relaxed text-ink-muted">
        I&apos;ve got your request. I&apos;ll be in touch to confirm the date and go over any
        details.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/portfolio"
          className="rounded-card bg-accent px-6 py-3 text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          Explore the portfolio
        </Link>
        <Link
          href="/"
          className="rounded-card border border-border px-6 py-3 text-sm font-medium text-ink-muted transition-colors duration-fast hover:border-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
};

// ── Icons ─────────────────────────────────────────────────────────────────────

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
