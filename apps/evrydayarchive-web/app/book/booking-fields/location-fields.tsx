'use client';

import { CORE_LOCATIONS, type CoreLocation } from '../../components/location-picker';
import { FieldError, FollowUp, chipCls, inputCls } from './field-ui';

export type LocationSelectValue = CoreLocation | 'Other' | '';

const OPTIONS: { value: CoreLocation | 'Other'; label: string }[] = [
  ...CORE_LOCATIONS.map((loc) => ({ value: loc, label: loc })),
  { value: 'Other', label: 'Other / not sure' }
];

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
}: Props) => {
  const otherSelected = select === 'Other';
  // The error belongs to the chips until "Other" is picked, then to its text box.
  const chipError = error && !otherSelected ? error : undefined;
  const otherError = error && otherSelected ? error : undefined;

  return (
    <div className="space-y-6">
      <fieldset
        className="space-y-3"
        aria-describedby={chipError ? 'location-note location-error' : 'location-note'}
      >
        <legend className="text-sm font-medium text-ink-muted">
          Where are you based?{' '}
          <span className="text-accent" aria-hidden="true">
            *
          </span>
        </legend>
        <p id="location-note" className="text-xs leading-relaxed text-ink-faint">
          I travel regularly between Vancouver Island and the mainland. Let me know which area
          you&apos;re in so I can confirm I&apos;ll be there.
        </p>
        <div className="flex flex-wrap gap-2">
          {OPTIONS.map((opt, i) => (
            <label key={opt.value} className={chipCls(select === opt.value)}>
              <input
                // The first chip is where focus goes when the location is missing.
                id={i === 0 ? 'location-select' : undefined}
                type="radio"
                name="location"
                value={opt.value}
                checked={select === opt.value}
                onChange={() => onSelectChange(opt.value)}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
        <FieldError id="location-error" message={chipError} />

        {otherSelected && (
          <FollowUp>
            <label htmlFor="location-other" className="text-sm font-medium text-ink-muted">
              Where, roughly?{' '}
              <span className="text-accent" aria-hidden="true">
                *
              </span>
            </label>
            <input
              id="location-other"
              type="text"
              placeholder="e.g. Tofino, Whistler, Victoria area…"
              value={other}
              onChange={(e) => onOtherChange(e.target.value)}
              aria-invalid={!!otherError}
              aria-describedby={otherError ? 'location-other-error' : undefined}
              className={inputCls(!!otherError)}
            />
            <FieldError id="location-other-error" message={otherError} />
          </FollowUp>
        )}
      </fieldset>

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
    </div>
  );
};
