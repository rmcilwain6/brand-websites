'use client';

import { useState } from 'react';
import { useToast } from '../../components/Toaster';

type TimeSlotStatus = 'AVAILABLE' | 'HELD' | 'UNAVAILABLE';

type TimeSlot = {
  id: string;
  startsAt: string;
  endsAt: string;
  status: TimeSlotStatus;
};

const statusLabel: Record<TimeSlotStatus, string> = {
  AVAILABLE: 'Available',
  HELD: 'Held',
  UNAVAILABLE: 'Unavailable'
};

const statusColors: Record<TimeSlotStatus, string> = {
  AVAILABLE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  HELD: 'bg-amber-50 text-amber-700 border-amber-200',
  UNAVAILABLE: 'bg-slate-100 text-slate-500 border-slate-200'
};

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

const toLocalDatetimeValue = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const defaultStart = () => {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return toLocalDatetimeValue(d);
};

const defaultEnd = () => {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 3);
  return toLocalDatetimeValue(d);
};

const AvailabilityManager = ({ initialSlots }: { initialSlots: TimeSlot[] }) => {
  const { addToast } = useToast();
  const [slots, setSlots] = useState(initialSlots);
  const [startsAt, setStartsAt] = useState(defaultStart);
  const [endsAt, setEndsAt] = useState(defaultEnd);
  const [adding, setAdding] = useState(false);

  const addSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);

    const response = await fetch('/api/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString()
      })
    });

    const payload = await response.json();
    setAdding(false);

    if (!payload.ok) {
      addToast(payload.error?.message ?? 'Unable to add slot.', 'error');
      return;
    }

    setSlots((prev) =>
      [...prev, payload.data].sort(
        (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
      )
    );
    addToast('Slot added.', 'success');
  };

  const updateStatus = async (id: string, status: TimeSlotStatus) => {
    const response = await fetch(`/api/availability/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });

    const payload = await response.json();
    if (!payload.ok) {
      addToast(payload.error?.message ?? 'Unable to update status.', 'error');
      return;
    }

    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    addToast('Status updated.', 'success');
  };

  const deleteSlot = async (id: string) => {
    const response = await fetch(`/api/availability/${id}`, { method: 'DELETE' });
    const payload = await response.json();

    if (!payload.ok) {
      addToast(payload.error?.message ?? 'Unable to delete slot.', 'error');
      return;
    }

    setSlots((prev) => prev.filter((s) => s.id !== id));
    addToast('Slot deleted.', 'success');
  };

  const otherStatuses = (current: TimeSlotStatus): TimeSlotStatus[] =>
    (['AVAILABLE', 'HELD', 'UNAVAILABLE'] as TimeSlotStatus[]).filter((s) => s !== current);

  return (
    <div className="space-y-8">
      {/* Add slot form */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Add time slot</h2>
        <form onSubmit={addSlot} className="mt-4 flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Start
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              required
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            End
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              required
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={adding}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {adding ? 'Adding…' : 'Add slot'}
          </button>
        </form>
      </section>

      {/* Slot list */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Time slots
          <span className="ml-2 text-sm font-normal text-slate-500">({slots.length})</span>
        </h2>

        {slots.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No time slots yet.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between gap-4 rounded-md border border-slate-100 px-4 py-3"
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[slot.status]}`}
                  >
                    {statusLabel[slot.status]}
                  </span>
                  <div className="text-sm text-slate-700">
                    <span className="font-medium">{formatDateTime(slot.startsAt)}</span>
                    <span className="mx-2 text-slate-400">→</span>
                    <span>{formatDateTime(slot.endsAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {otherStatuses(slot.status).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => updateStatus(slot.id, s)}
                      className="text-xs font-medium text-slate-500 hover:text-indigo-600"
                    >
                      Mark {statusLabel[s].toLowerCase()}
                    </button>
                  ))}
                  <span className="text-slate-200">|</span>
                  <button
                    type="button"
                    onClick={() => deleteSlot(slot.id)}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AvailabilityManager;
