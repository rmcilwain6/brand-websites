'use client';

import {
  APPLICANT_STATUSES,
  APPLICANT_STATUS_LABELS,
  type ApplicantStatus
} from '@repo/core/campaigns';
import { useState } from 'react';

import { useToast } from '../../components/Toaster';
import { campaignReply } from '../../lib/campaign-replies';
import CopyCodeButton from '../../vouchers/components/CopyCodeButton';

type Props = {
  bookingId: string;
  currentStatus: ApplicantStatus;
  applicantName: string;
};

/** Sets whether an applicant is featured, and offers the matching reply to send by hand. */
const ApplicantStatusControl = ({ bookingId, currentStatus, applicantName }: Props) => {
  const { addToast } = useToast();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);

  const handleChange = async (next: ApplicantStatus) => {
    if (next === status || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicantStatus: next })
      });
      if (!res.ok) throw new Error('Failed to update applicant status');
      setStatus(next);
      addToast('Applicant status updated.', 'success');
    } catch {
      addToast('Failed to update applicant status.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const reply = campaignReply(status, applicantName);

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-4">
      <p className="mb-2 text-xs font-medium text-slate-500">Applicant status</p>
      <div className="flex flex-wrap gap-2">
        {APPLICANT_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => handleChange(s)}
            disabled={saving}
            aria-pressed={status === s}
            className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
              status === s
                ? 'border-indigo-600 bg-indigo-600 text-white'
                : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {APPLICANT_STATUS_LABELS[s]}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-400">This doesn’t email the applicant.</p>

      {reply && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-slate-500">Reply to send</p>
            <CopyCodeButton code={reply} label="reply" />
          </div>
          <p className="whitespace-pre-wrap rounded-md bg-slate-50 px-3 py-3 text-sm text-slate-700">
            {reply}
          </p>
        </div>
      )}
    </div>
  );
};

export default ApplicantStatusControl;
