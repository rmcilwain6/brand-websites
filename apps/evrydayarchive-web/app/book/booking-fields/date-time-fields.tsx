'use client';

import type { LocationWindow } from '@repo/core';

import { DatePicker } from '../date-picker';
import { TimePicker } from '../time-picker';
import { FieldError } from './field-ui';

type Props = {
  date: string;
  time: string;
  onDateChange: (v: string) => void;
  onTimeChange: (v: string) => void;
  /** Earliest selectable date, YYYY-MM-DD. */
  minDate: string;
  unavailableDates: Set<string>;
  locationWindows: LocationWindow[];
  dateError: string | undefined;
};

export const DateTimeFields = ({
  date,
  time,
  onDateChange,
  onTimeChange,
  minDate,
  unavailableDates,
  locationWindows,
  dateError
}: Props) => (
  <fieldset className="space-y-5">
    <legend className="sr-only">Preferred date &amp; time</legend>
    <p className="text-xs leading-relaxed text-ink-faint">
      This is a preference, not a confirmed slot. I&apos;ll reach out to confirm availability. Dates
      shown in red are unavailable.
    </p>
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="preferred-date" className="text-sm font-medium text-ink-muted">
          Preferred date{' '}
          <span className="text-accent" aria-hidden="true">
            *
          </span>
        </label>
        <DatePicker
          id="preferred-date"
          value={date}
          onChange={onDateChange}
          min={minDate}
          unavailableDates={unavailableDates}
          locationWindows={locationWindows}
          placeholder="Choose a date"
          hasError={!!dateError}
          aria-describedby={dateError ? 'date-error' : undefined}
        />
        <FieldError id="date-error" message={dateError} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="preferred-time" className="text-sm font-medium text-ink-muted">
          Preferred time <span className="text-xs font-normal text-ink-faint">(optional)</span>
        </label>
        <TimePicker id="preferred-time" value={time} onChange={onTimeChange} />
      </div>
    </div>
  </fieldset>
);
