'use client';

import { useEffect, useRef, useState } from 'react';

import type { LocationWindow, TimeSlot } from '@repo/core';

import { ContactFields, type ContactValues } from './booking-fields/contact-fields';
import { DateTimeFields } from './booking-fields/date-time-fields';
import { LocationFields, type LocationSelectValue } from './booking-fields/location-fields';
import { NotesField } from './booking-fields/notes-field';
import { ReferralFields, type ReferralValues } from './booking-fields/referral-fields';
import { BookingStep, stepHeadingId, type StepStatus } from './booking-step';
import { ConfirmationPanel } from './confirmation-panel';
import { SelectionSummary, type BookingSelection } from './selection-summary';

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = {
  /** The package being booked, or null when /book is opened without one. */
  selection: BookingSelection | null;
  timeSlots: TimeSlot[];
  locationWindows: LocationWindow[];
};

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

type FieldErrors = Partial<Record<'name' | 'email' | 'phone' | 'location' | 'date', string>>;

// ── Steps ─────────────────────────────────────────────────────────────────────

const STEPS = [
  { title: 'Where & when', hint: 'Your area and a date that suits you' },
  { title: 'Your details', hint: 'Name and email' },
  { title: 'A few extras', hint: 'Referrals, voucher codes, notes', optional: true }
] as const;

const LAST_STEP = STEPS.length - 1;

/** Which step each validated field lives in. */
const FIELD_STEP: Record<keyof FieldErrors, number> = {
  location: 0,
  date: 0,
  name: 1,
  email: 1,
  phone: 1
};

// ── Availability helpers ──────────────────────────────────────────────────────

const buildUnavailableDates = (slots: TimeSlot[]): Set<string> => {
  const set = new Set<string>();
  for (const slot of slots) {
    if (slot.status === 'UNAVAILABLE') {
      const start = new Date(slot.startsAt);
      const end = new Date(slot.endsAt);
      const cursor = new Date(start);
      cursor.setUTCHours(0, 0, 0, 0);
      end.setUTCHours(0, 0, 0, 0);
      while (cursor <= end) {
        set.add(cursor.toISOString().split('T')[0] as string);
        cursor.setUTCDate(cursor.getUTCDate() + 1);
      }
    }
  }
  return set;
};

// ── Validation helpers ────────────────────────────────────────────────────────

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

// Strip formatting; valid if 10–15 digits remain (covers NA + international)
const isValidPhone = (v: string) => {
  const digits = v.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
};

// ── Summary helpers ───────────────────────────────────────────────────────────

/** "2026-11-14" → "Sat, Nov 14". Noon avoids the date shifting across time zones. */
const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

/** "14:30" → "2:30 PM". */
const formatTime = (hhmm: string) => {
  const [h = 0, m = 0] = hhmm.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

const focusById = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  // Centre it so the sticky desktop header can't cover it.
  el.focus({ preventScroll: true });
  el.scrollIntoView({ block: 'center', behavior: 'smooth' });
};

// ── Main component ────────────────────────────────────────────────────────────

export const BookingForm = ({ selection, timeSlots, locationWindows }: Props) => {
  const [status, setStatus] = useState<FormStatus>('idle');
  const [serverError, setServerError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submittedName, setSubmittedName] = useState('');
  const [submittedVoucher, setSubmittedVoucher] = useState(false);

  // The open step, and the furthest step reached. Steps up to `furthestStep` can be reopened.
  const [step, setStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);
  // What to focus once a newly opened step renders: a field with an error, or the step heading.
  const pendingFocus = useRef<string | null>(null);

  const [contact, setContact] = useState<ContactValues>({ name: '', email: '', phone: '' });
  const [locationSelect, setLocationSelect] = useState<LocationSelectValue>('');
  const [locationOther, setLocationOther] = useState('');
  const [locationIdeas, setLocationIdeas] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [notes, setNotes] = useState('');
  const [referral, setReferral] = useState<ReferralValues>({
    heardFrom: '',
    referrerName: '',
    referrerContact: '',
    voucherCode: ''
  });
  // Honeypot: hidden from people; only bots fill it in. The admin API drops those requests.
  const [website, setWebsite] = useState('');

  const [unavailableDates] = useState(() => buildUnavailableDates(timeSlots));

  // The visitor's local date. toISOString() would give the UTC date, which in the evening in
  // BC is already tomorrow, wrongly marking today as past in the date picker.
  const now = new Date();
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
  ].join('-');

  const { name, email, phone } = contact;

  // ── Derived location value ──────────────────────────────────────────────────

  const resolvedLocation = locationSelect === 'Other' ? locationOther.trim() : locationSelect;

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

    if (!resolvedLocation) {
      errs.location =
        locationSelect === 'Other'
          ? 'Please describe the shoot location.'
          : 'Please select a location.';
    }

    if (!preferredDate) {
      errs.date = 'Please choose a preferred date.';
    }

    return errs;
  };

  /** Errors for the fields in steps up to and including `upTo`. */
  const validateThrough = (upTo: number): FieldErrors =>
    Object.fromEntries(
      Object.entries(validate()).filter(([field]) => FIELD_STEP[field as keyof FieldErrors] <= upTo)
    );

  const clearError = (field: keyof FieldErrors) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Fields in page order, so the first error focused is the one highest on the page.
  const firstErrorId = (errs: FieldErrors): string | undefined => {
    const fieldIds: [keyof FieldErrors, string][] = [
      ['location', locationSelect === 'Other' ? 'location-other' : 'location-select'],
      ['date', 'preferred-date'],
      ['name', 'name'],
      ['email', 'email'],
      ['phone', 'phone']
    ];
    return fieldIds.find(([field]) => errs[field])?.[1];
  };

  // ── Step navigation ─────────────────────────────────────────────────────────

  const openStep = (next: number, focusId?: string) => {
    pendingFocus.current = focusId ?? stepHeadingId(next);
    setStep(next);
    setFurthestStep((f) => Math.max(f, next));
  };

  // Move focus once the newly opened step has rendered, so keyboard and screen-reader users
  // land in the step they're on rather than on a button that has just disappeared.
  useEffect(() => {
    const id = pendingFocus.current;
    pendingFocus.current = null;
    if (id) focusById(id);
  }, [step]);

  /** Validates the open step, then moves on: to the furthest step if an earlier one was being edited. */
  const continueFrom = (current: number) => {
    const errs = validateThrough(current);
    const badSteps = Object.keys(errs).map((f) => FIELD_STEP[f as keyof FieldErrors]);
    if (badSteps.length > 0) {
      setFieldErrors(errs);
      const firstBad = Math.min(...badSteps);
      const id = firstErrorId(errs);
      if (firstBad === current) {
        if (id) focusById(id);
      } else {
        openStep(firstBad, id);
      }
      return;
    }
    setFieldErrors({});
    openStep(Math.max(current + 1, furthestStep));
  };

  const stepStatus = (i: number): StepStatus =>
    i === step ? 'open' : i < furthestStep ? 'done' : 'upcoming';

  const stepSummaries = [
    [
      resolvedLocation,
      preferredDate && formatDate(preferredDate),
      preferredTime && formatTime(preferredTime)
    ]
      .filter(Boolean)
      .join(' · '),
    [name.trim(), email.trim()].filter(Boolean).join(' · '),
    ''
  ];

  const stepProps = (i: number) => {
    const s = STEPS[i]!;
    const status = stepStatus(i);
    return {
      index: i,
      title: s.title,
      optional: 'optional' in s && s.optional,
      status,
      subtitle: status === 'done' ? stepSummaries[i] || s.hint : s.hint,
      onOpen: i <= furthestStep ? () => openStep(i) : undefined
    };
  };

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError('');

    // Enter in an earlier step's field means "Continue", not "Send".
    if (step < LAST_STEP) {
      continueFrom(step);
      return;
    }

    // Earlier steps can be reopened and changed without pressing Continue, so check them all.
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      continueFrom(LAST_STEP);
      return;
    }

    setStatus('submitting');

    const modifierValues = selection?.modifierValues ?? {};
    const referrerName = referral.referrerName.trim();
    const voucherCode = referral.voucherCode.trim();
    const payload = {
      name,
      email,
      phone: phone || undefined,
      location: resolvedLocation,
      preferredDate,
      preferredTime: preferredTime || undefined,
      notes: notes || undefined,
      locationIdeas: locationIdeas.trim() || undefined,
      heardFrom: referral.heardFrom || undefined,
      referrerName: referrerName || undefined,
      // The contact field is only shown with a name, so drop a contact left behind by a cleared name.
      referrerContact: (referrerName && referral.referrerContact.trim()) || undefined,
      voucherCode: voucherCode || undefined,
      website: website || undefined,
      packageId: selection?.pkg.id,
      packageName: selection?.pkg.name,
      modifierIds: (selection?.modifiers ?? []).filter((m) => !m.isRequired).map((m) => m.id),
      modifierValues: Object.keys(modifierValues).length > 0 ? modifierValues : undefined,
      estimatedTotalCents: selection?.estimatedTotalCents
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
      setSubmittedVoucher(!!voucherCode);
      setStatus('success');
    } catch {
      setServerError('Unable to reach the server. Please check your connection and try again.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return <ConfirmationPanel name={submittedName} voucherEntered={submittedVoucher} />;
  }

  const continueButton = (
    <button
      type="submit"
      className="w-full rounded-card bg-accent px-8 py-3.5 text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent sm:w-auto"
    >
      Continue
    </button>
  );

  return (
    <>
      <div className="min-w-0 flex-1">
        {/* Mobile-only package summary — desktop has a sidebar */}
        {selection && (
          <SelectionSummary selection={selection} variant="compact" className="mb-4 lg:hidden" />
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-3">
          <BookingStep {...stepProps(0)}>
            <LocationFields
              select={locationSelect}
              other={locationOther}
              onSelectChange={(v) => {
                setLocationSelect(v);
                setLocationOther('');
                clearError('location');
              }}
              onOtherChange={(v) => {
                setLocationOther(v);
                clearError('location');
              }}
              error={fieldErrors.location}
              ideas={locationIdeas}
              onIdeasChange={setLocationIdeas}
            />

            <DateTimeFields
              date={preferredDate}
              time={preferredTime}
              onDateChange={(v) => {
                setPreferredDate(v);
                clearError('date');
              }}
              onTimeChange={setPreferredTime}
              minDate={today}
              unavailableDates={unavailableDates}
              locationWindows={locationWindows}
              dateError={fieldErrors.date}
            />

            {continueButton}
          </BookingStep>

          <BookingStep {...stepProps(1)}>
            <ContactFields
              values={contact}
              onChange={(field, value) => {
                setContact((prev) => ({ ...prev, [field]: value }));
                clearError(field);
              }}
              errors={fieldErrors}
            />

            {continueButton}
          </BookingStep>

          <BookingStep {...stepProps(2)}>
            <ReferralFields
              values={referral}
              onChange={(field, value) => setReferral((prev) => ({ ...prev, [field]: value }))}
            />

            <NotesField value={notes} onChange={setNotes} />

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
              <p className="text-[13px] leading-relaxed text-ink-soft sm:text-sm">
                No commitment. I&apos;ll be in touch soon.
              </p>
            </div>
          </BookingStep>

          {/* Honeypot — off-screen and skipped by keyboard and screen readers. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
        </form>
      </div>

      {selection && (
        <aside className="hidden lg:block lg:w-80 lg:flex-none lg:sticky lg:top-8">
          <SelectionSummary selection={selection} variant="full" />
          <div className="mt-6 px-1">
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-ink-soft">
              What happens next
            </p>
            <p className="text-sm leading-relaxed text-ink-muted">
              Once you submit, I&apos;ll review your request and be in touch to confirm the date and
              sort out any details.
            </p>
          </div>
        </aside>
      )}
    </>
  );
};
