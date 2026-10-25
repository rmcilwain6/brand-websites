'use client';

import { useRef, useState } from 'react';

import type { LocationWindow, TimeSlot } from '@repo/core';

import { ContactFields, type ContactValues } from './booking-fields/contact-fields';
import { DateTimeFields } from './booking-fields/date-time-fields';
import { LocationFields, type LocationSelectValue } from './booking-fields/location-fields';
import { NotesField } from './booking-fields/notes-field';
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

// ── Main component ────────────────────────────────────────────────────────────

export const BookingForm = ({ selection, timeSlots, locationWindows }: Props) => {
  const [status, setStatus] = useState<FormStatus>('idle');
  const [serverError, setServerError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submittedName, setSubmittedName] = useState('');

  const [contact, setContact] = useState<ContactValues>({ name: '', email: '', phone: '' });
  const [locationSelect, setLocationSelect] = useState<LocationSelectValue>('');
  const [locationOther, setLocationOther] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [notes, setNotes] = useState('');

  const [unavailableDates] = useState(() => buildUnavailableDates(timeSlots));

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const locationOtherRef = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().split('T')[0] as string;

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
      if (errs.name) nameRef.current?.focus();
      else if (errs.email) emailRef.current?.focus();
      else if (errs.phone) phoneRef.current?.focus();
      else if (errs.location && locationSelect === 'Other') locationOtherRef.current?.focus();
      return;
    }

    setStatus('submitting');

    const modifierValues = selection?.modifierValues ?? {};
    const payload = {
      name,
      email,
      phone: phone || undefined,
      location: resolvedLocation,
      preferredDate,
      preferredTime: preferredTime || undefined,
      notes: notes || undefined,
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
    <>
      <div className="min-w-0 flex-1">
        <form onSubmit={handleSubmit} noValidate className="space-y-10">
          {/* Mobile-only package summary — desktop has a sidebar */}
          {selection && (
            <SelectionSummary selection={selection} variant="compact" className="lg:hidden" />
          )}

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
            otherRef={locationOtherRef}
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

          <ContactFields
            values={contact}
            onChange={(field, value) => {
              setContact((prev) => ({ ...prev, [field]: value }));
              clearError(field);
            }}
            errors={fieldErrors}
            refs={{ name: nameRef, email: emailRef, phone: phoneRef }}
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
            <p className="text-xs leading-relaxed text-ink-faint">
              No commitment. I&apos;ll be in touch soon.
            </p>
          </div>
        </form>
      </div>

      {selection && (
        <aside className="hidden lg:block lg:w-80 lg:flex-none lg:sticky lg:top-8">
          <SelectionSummary selection={selection} variant="full" />
          <div className="mt-6 px-1">
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-ink-faint">
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
