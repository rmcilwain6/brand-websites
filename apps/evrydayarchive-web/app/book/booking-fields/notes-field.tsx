'use client';

import { inputCls } from './field-ui';

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export const NotesField = ({ value, onChange }: Props) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor="notes" className="text-sm font-medium text-ink-muted">
      Anything else I should know?{' '}
      <span className="text-xs font-normal text-ink-faint">(optional)</span>
    </label>
    <textarea
      id="notes"
      rows={4}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Vision, vibe, special requests…"
      className={`${inputCls()} resize-none`}
    />
  </div>
);
