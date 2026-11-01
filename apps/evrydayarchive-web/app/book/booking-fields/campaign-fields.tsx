'use client';

import Link from 'next/link';

// Subpath import keeps the core package's Zod schemas out of the client bundle.
import { CAMPAIGN } from '@repo/core/campaigns';

import { FieldError, FollowUp, inputCls } from './field-ui';

export type CampaignValues = {
  apply: boolean;
  whatWorkingOn: string;
  aboutIt: string;
  link: string;
  othersInvolved: string;
  acknowledged: boolean;
};

type Props = {
  values: CampaignValues;
  onChange: <K extends keyof CampaignValues>(field: K, value: CampaignValues[K]) => void;
  errors: { whatWorkingOn?: string; acknowledged?: string };
};

const labelCls = 'text-sm font-medium text-ink-muted sm:text-[15px]';
const checkboxCls = 'mt-0.5 h-5 w-5 flex-none cursor-pointer accent-accent';

const Optional = () => <span className="text-[13px] font-normal text-ink-soft">(optional)</span>;

export const CampaignFields = ({ values, onChange, errors }: Props) => (
  <div className="space-y-6">
    <div className="space-y-2">
      <label className="flex cursor-pointer items-start gap-3 text-base font-medium text-ink">
        <input
          id="campaign-apply"
          type="checkbox"
          checked={values.apply}
          onChange={(e) => onChange('apply', e.target.checked)}
          aria-describedby="campaign-disclaimer"
          className={checkboxCls}
        />
        {CAMPAIGN.copy.apply}
      </label>
      <p
        id="campaign-disclaimer"
        className="text-[13px] leading-relaxed text-ink-soft sm:pl-8 sm:text-sm"
      >
        {CAMPAIGN.copy.disclaimer}{' '}
        {/* A new tab, so reading about the campaign doesn't lose what's typed in the form. */}
        <Link
          href="/passion-projects"
          target="_blank"
          rel="noopener"
          className="whitespace-nowrap font-medium text-accent underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          Find out more
          <span aria-hidden="true"> ↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </Link>
      </p>
    </div>

    {values.apply && (
      <FollowUp>
        <div className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="campaign-what-working-on" className={labelCls}>
              What are you working on?{' '}
              <span className="text-accent" aria-hidden="true">
                *
              </span>
            </label>
            <input
              id="campaign-what-working-on"
              type="text"
              maxLength={200}
              autoComplete="off"
              placeholder="e.g. a sewing business"
              value={values.whatWorkingOn}
              onChange={(e) => onChange('whatWorkingOn', e.target.value)}
              aria-required="true"
              aria-invalid={!!errors.whatWorkingOn}
              aria-describedby={errors.whatWorkingOn ? 'campaign-what-working-on-error' : undefined}
              className={inputCls(!!errors.whatWorkingOn)}
            />
            <FieldError id="campaign-what-working-on-error" message={errors.whatWorkingOn} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="campaign-about-it" className={labelCls}>
              Tell me a bit about it <Optional />
            </label>
            <textarea
              id="campaign-about-it"
              rows={3}
              maxLength={2000}
              placeholder="How long you've been at it, and what a normal day of it looks like."
              value={values.aboutIt}
              onChange={(e) => onChange('aboutIt', e.target.value)}
              className={`${inputCls()} resize-none`}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="campaign-link" className={labelCls}>
              Link to the work <Optional />
            </label>
            <input
              id="campaign-link"
              type="text"
              maxLength={500}
              autoComplete="off"
              placeholder="Instagram, website or shop"
              value={values.link}
              onChange={(e) => onChange('link', e.target.value)}
              className={inputCls()}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="campaign-others-involved" className={labelCls}>
              Anyone else involved? <Optional />
            </label>
            <input
              id="campaign-others-involved"
              type="text"
              maxLength={500}
              autoComplete="off"
              placeholder="Bandmates, staff, a partner"
              value={values.othersInvolved}
              onChange={(e) => onChange('othersInvolved', e.target.value)}
              className={inputCls()}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-ink-muted sm:text-[15px]">
              <input
                id="campaign-acknowledged"
                type="checkbox"
                checked={values.acknowledged}
                onChange={(e) => onChange('acknowledged', e.target.checked)}
                aria-required="true"
                aria-invalid={!!errors.acknowledged}
                aria-describedby={errors.acknowledged ? 'campaign-acknowledged-error' : undefined}
                className={checkboxCls}
              />
              <span>
                {CAMPAIGN.copy.acknowledgement}&nbsp;
                <span className="text-accent" aria-hidden="true">
                  *
                </span>
              </span>
            </label>
            <FieldError id="campaign-acknowledged-error" message={errors.acknowledged} />
          </div>
        </div>
      </FollowUp>
    )}
  </div>
);
