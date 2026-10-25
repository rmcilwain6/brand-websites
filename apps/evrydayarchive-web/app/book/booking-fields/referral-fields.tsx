'use client';

// Subpath imports keep the core package's Zod schemas out of the client bundle.
import { HEARD_FROM_OPTIONS, REFERRAL, type HeardFrom } from '@repo/core/referrals';
import { formatVoucherDiscount } from '@repo/core/vouchers';

import { cn } from '../../lib/cn';
import { inputCls } from './field-ui';

export type ReferralValues = {
  heardFrom: HeardFrom | '';
  referrerName: string;
  referrerContact: string;
  voucherCode: string;
};

type Props = {
  values: ReferralValues;
  onChange: <K extends keyof ReferralValues>(field: K, value: ReferralValues[K]) => void;
};

const referralReward = `${formatVoucherDiscount(REFERRAL.discount)} off a session`;

const Optional = () => <span className="text-xs font-normal text-ink-faint">(optional)</span>;

export const ReferralFields = ({ values, onChange }: Props) => {
  const hasReferrer = values.referrerName.trim() !== '';

  return (
    <fieldset className="space-y-5">
      <legend className="text-sm font-semibold text-ink">How you found me</legend>

      {/* How did you hear */}
      <div className="flex flex-col gap-2">
        <p id="heard-from-label" className="text-sm font-medium text-ink-muted">
          How did you hear about this? <Optional />
        </p>
        <div role="radiogroup" aria-labelledby="heard-from-label" className="flex flex-wrap gap-2">
          {HEARD_FROM_OPTIONS.map((opt) => {
            const checked = values.heardFrom === opt.value;
            return (
              <label
                key={opt.value}
                className={cn(
                  'cursor-pointer rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-fast',
                  'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent',
                  checked
                    ? 'border-accent bg-accent font-medium text-white'
                    : 'border-border text-ink-muted hover:border-ink-muted hover:text-ink'
                )}
              >
                <input
                  type="radio"
                  name="heard-from"
                  value={opt.value}
                  checked={checked}
                  onChange={() => onChange('heardFrom', opt.value)}
                  // Tapping the selected chip again clears the answer.
                  onClick={() => checked && onChange('heardFrom', '')}
                  className="sr-only"
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      </div>

      {/* Referrer */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="referrer-name" className="text-sm font-medium text-ink-muted">
          Did someone send you my way? <Optional />
        </label>
        <input
          id="referrer-name"
          type="text"
          maxLength={200}
          autoComplete="off"
          placeholder="Their name"
          value={values.referrerName}
          onChange={(e) => onChange('referrerName', e.target.value)}
          aria-describedby="referrer-note"
          className={inputCls()}
        />
        <p id="referrer-note" className="text-xs leading-relaxed text-ink-faint">
          If you book, the person who sent you gets {referralReward}.
        </p>
      </div>

      {hasReferrer && (
        <div className="flex animate-fade-in flex-col gap-1.5">
          <label htmlFor="referrer-contact" className="text-sm font-medium text-ink-muted">
            How can I reach them? <Optional />
          </label>
          <input
            id="referrer-contact"
            type="text"
            maxLength={200}
            autoComplete="off"
            placeholder="Instagram handle, email, or phone"
            value={values.referrerContact}
            onChange={(e) => onChange('referrerContact', e.target.value)}
            aria-describedby="referrer-contact-note"
            className={inputCls()}
          />
          <p id="referrer-contact-note" className="text-xs leading-relaxed text-ink-faint">
            So I can send them their code.
          </p>
        </div>
      )}

      {/* Voucher code */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="voucher-code" className="text-sm font-medium text-ink-muted">
          Have a voucher code? <Optional />
        </label>
        <input
          id="voucher-code"
          type="text"
          maxLength={50}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="EAC-XXXX"
          value={values.voucherCode}
          onChange={(e) => onChange('voucherCode', e.target.value)}
          aria-describedby="voucher-code-note"
          className={inputCls()}
        />
        <p id="voucher-code-note" className="text-xs leading-relaxed text-ink-faint">
          I&apos;ll confirm it by email.
        </p>
      </div>
    </fieldset>
  );
};
