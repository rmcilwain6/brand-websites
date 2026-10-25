'use client';

import { LocationPicker } from '../../components/location-picker';
import type { CoreLocation } from '../../components/location-picker';
import { FieldError, inputCls } from './field-ui';

export type LocationSelectValue = CoreLocation | 'Other' | '';

type Props = {
  select: LocationSelectValue;
  other: string;
  onSelectChange: (v: LocationSelectValue) => void;
  onOtherChange: (v: string) => void;
  error: string | undefined;
  /** Optional "Anywhere in mind?" spot ideas, shown under the city. */
  ideas: string;
  onIdeasChange: (v: string) => void;
};

export const LocationFields = ({
  select,
  other,
  onSelectChange,
  onOtherChange,
  error,
  ideas,
  onIdeasChange
}: Props) => (
  <fieldset className="space-y-5">
    <legend className="text-sm font-semibold text-ink">Where are you based?</legend>
    <p className="text-xs leading-relaxed text-ink-faint">
      I travel regularly between Vancouver Island and the mainland. Let me know which area
      you&apos;re in so I can confirm I&apos;ll be there.
    </p>

    <div className="flex flex-col gap-1.5">
      <label htmlFor="location-select" className="text-sm font-medium text-ink-muted">
        Location{' '}
        <span className="text-accent" aria-hidden="true">
          *
        </span>
      </label>
      <LocationPicker
        id="location-select"
        value={select}
        onChange={onSelectChange}
        hasError={!!error && select !== 'Other'}
        aria-describedby={error && select !== 'Other' ? 'location-error' : undefined}
      />

      {select === 'Other' && (
        <input
          id="location-other"
          type="text"
          placeholder="e.g. Tofino, Whistler, Victoria area…"
          value={other}
          onChange={(e) => onOtherChange(e.target.value)}
          aria-label="Describe your location"
          aria-invalid={!!error}
          aria-describedby={error ? 'location-error' : undefined}
          className={inputCls(!!error)}
        />
      )}

      <FieldError id="location-error" message={error} />
    </div>

    <div className="flex flex-col gap-1.5">
      <label htmlFor="location-ideas" className="text-sm font-medium text-ink-muted">
        Anywhere in mind? <span className="text-xs font-normal text-ink-faint">(optional)</span>
      </label>
      <input
        id="location-ideas"
        type="text"
        maxLength={500}
        placeholder="A market, your studio, a park, your home…"
        value={ideas}
        onChange={(e) => onIdeasChange(e.target.value)}
        className={inputCls()}
      />
    </div>
  </fieldset>
);
