'use client';

import { useState } from 'react';
import { useToast } from '../../components/Toaster';

type Location = { id: string; name: string };

type LocationWindow = {
  id: string;
  startDate: string;
  endDate: string;
  notes: string | null;
  location: { id: string; name: string };
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  });

const toDateInputValue = (iso: string) => iso.slice(0, 10);

const ScheduleManager = ({
  initialLocations,
  initialWindows
}: {
  initialLocations: Location[];
  initialWindows: LocationWindow[];
}) => {
  const { addToast } = useToast();

  // ── Locations ──────────────────────────────────────────────────────────────
  const [locations, setLocations] = useState(initialLocations);
  const [newLocationName, setNewLocationName] = useState('');
  const [addingLocation, setAddingLocation] = useState(false);

  const addLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingLocation(true);

    const response = await fetch('/api/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newLocationName.trim() })
    });

    const payload = await response.json();
    setAddingLocation(false);

    if (!payload.ok) {
      addToast(payload.error?.message ?? 'Unable to add location.', 'error');
      return;
    }

    setLocations((prev) => [...prev, payload.data].sort((a, b) => a.name.localeCompare(b.name)));
    setWindowForm((prev) => ({ ...prev, locationId: prev.locationId || payload.data.id }));
    setNewLocationName('');
    addToast('Location added.', 'success');
  };

  const deleteLocation = async (id: string) => {
    const response = await fetch(`/api/locations/${id}`, { method: 'DELETE' });
    const payload = await response.json();

    if (!payload.ok) {
      addToast(payload.error?.message ?? 'Unable to delete location.', 'error');
      return;
    }

    setLocations((prev) => prev.filter((l) => l.id !== id));
    setWindows((prev) => prev.filter((w) => w.location.id !== id));
    addToast('Location deleted.', 'success');
  };

  // ── Location windows ────────────────────────────────────────────────────────
  const [windows, setWindows] = useState(initialWindows);
  const [windowForm, setWindowForm] = useState({
    locationId: initialLocations[0]?.id ?? '',
    startDate: '',
    endDate: '',
    notes: ''
  });
  const [addingWindow, setAddingWindow] = useState(false);
  const [editingWindowId, setEditingWindowId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    locationId: '',
    startDate: '',
    endDate: '',
    notes: ''
  });

  const addWindow = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingWindow(true);

    const response = await fetch('/api/location-windows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locationId: windowForm.locationId,
        startDate: windowForm.startDate,
        endDate: windowForm.endDate || windowForm.startDate,
        notes: windowForm.notes || undefined
      })
    });

    const payload = await response.json();
    setAddingWindow(false);

    if (!payload.ok) {
      addToast(payload.error?.message ?? 'Unable to add window.', 'error');
      return;
    }

    setWindows((prev) =>
      [...prev, payload.data].sort(
        (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      )
    );
    setWindowForm((prev) => ({ ...prev, startDate: '', endDate: '', notes: '' }));
    addToast('Location window added.', 'success');
  };

  const startEditWindow = (w: LocationWindow) => {
    setEditingWindowId(w.id);
    setEditForm({
      locationId: w.location.id,
      startDate: toDateInputValue(w.startDate),
      endDate: toDateInputValue(w.endDate),
      notes: w.notes ?? ''
    });
  };

  const saveEditWindow = async (id: string) => {
    const response = await fetch(`/api/location-windows/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locationId: editForm.locationId,
        startDate: editForm.startDate,
        endDate: editForm.endDate || editForm.startDate,
        notes: editForm.notes || null
      })
    });

    const payload = await response.json();
    if (!payload.ok) {
      addToast(payload.error?.message ?? 'Unable to update window.', 'error');
      return;
    }

    setWindows((prev) =>
      prev
        .map((w) => (w.id === id ? payload.data : w))
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    );
    setEditingWindowId(null);
    addToast('Window updated.', 'success');
  };

  const deleteWindow = async (id: string) => {
    const response = await fetch(`/api/location-windows/${id}`, { method: 'DELETE' });
    const payload = await response.json();

    if (!payload.ok) {
      addToast(payload.error?.message ?? 'Unable to delete window.', 'error');
      return;
    }

    setWindows((prev) => prev.filter((w) => w.id !== id));
    addToast('Window deleted.', 'success');
  };

  return (
    <div className="space-y-8">
      {/* Locations */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Locations</h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage the fixed list of location names used when scheduling windows.
        </p>

        <form onSubmit={addLocation} className="mt-4 flex gap-3">
          <input
            type="text"
            value={newLocationName}
            onChange={(e) => setNewLocationName(e.target.value)}
            placeholder="e.g. Vancouver"
            required
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={addingLocation}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:bg-indigo-300"
          >
            {addingLocation ? 'Adding…' : 'Add'}
          </button>
        </form>

        {locations.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No locations yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {locations.map((loc) => (
              <li
                key={loc.id}
                className="flex items-center justify-between rounded-md border border-slate-100 px-4 py-2.5"
              >
                <span className="text-sm font-medium text-slate-800">{loc.name}</span>
                <button
                  type="button"
                  onClick={() => deleteLocation(loc.id)}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-500"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Location windows */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Location windows</h2>
        <p className="mt-1 text-sm text-slate-500">
          Assign a location to a date range. Leave end date blank for a single day.
        </p>

        {locations.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">
            Add at least one location in the section above first.
          </p>
        ) : (
          <form onSubmit={addWindow} className="mt-4 flex flex-wrap items-end gap-4">
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Location
              <select
                value={windowForm.locationId}
                onChange={(e) => setWindowForm((prev) => ({ ...prev, locationId: e.target.value }))}
                required
                className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Start date
              <input
                type="date"
                value={windowForm.startDate}
                onChange={(e) => setWindowForm((prev) => ({ ...prev, startDate: e.target.value }))}
                required
                className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              End date
              <input
                type="date"
                value={windowForm.endDate}
                onChange={(e) => setWindowForm((prev) => ({ ...prev, endDate: e.target.value }))}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Notes (optional)
              <input
                type="text"
                value={windowForm.notes}
                onChange={(e) => setWindowForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="e.g. Available for outdoor sessions"
                className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <button
              type="submit"
              disabled={addingWindow}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:bg-indigo-300"
            >
              {addingWindow ? 'Adding…' : 'Add window'}
            </button>
          </form>
        )}

        {windows.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">No location windows yet.</p>
        ) : (
          <div className="mt-6 space-y-2">
            {windows.map((w) =>
              editingWindowId === w.id ? (
                <div
                  key={w.id}
                  className="flex flex-wrap items-end gap-4 rounded-md border border-indigo-200 bg-indigo-50 p-4"
                >
                  <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                    Location
                    <select
                      value={editForm.locationId}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, locationId: e.target.value }))
                      }
                      className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                    >
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                    Start date
                    <input
                      type="date"
                      value={editForm.startDate}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, startDate: e.target.value }))
                      }
                      className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                    End date
                    <input
                      type="date"
                      value={editForm.endDate}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, endDate: e.target.value }))
                      }
                      className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                    Notes
                    <input
                      type="text"
                      value={editForm.notes}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, notes: e.target.value }))}
                      className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                    />
                  </label>
                  <div className="flex gap-2 self-end pb-0.5">
                    <button
                      type="button"
                      onClick={() => saveEditWindow(w.id)}
                      className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingWindowId(null)}
                      className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  key={w.id}
                  className="flex items-center justify-between gap-4 rounded-md border border-slate-100 px-4 py-3"
                >
                  <div>
                    <span className="text-sm font-semibold text-slate-800">{w.location.name}</span>
                    <span className="mx-2 text-slate-300">·</span>
                    <span className="text-sm text-slate-600">
                      {formatDate(w.startDate)}
                      {w.startDate !== w.endDate && ` – ${formatDate(w.endDate)}`}
                    </span>
                    {w.notes && <p className="mt-0.5 text-xs text-slate-500">{w.notes}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => startEditWindow(w)}
                      className="text-xs font-medium text-slate-500 hover:text-indigo-600"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteWindow(w.id)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default ScheduleManager;
