'use client';

import Link from 'next/link';
import { useState } from 'react';

import type { ModifierType } from '@repo/core';

const statusOptions = ['DRAFT', 'ACTIVE', 'ARCHIVED'] as const;
type PackageStatus = (typeof statusOptions)[number];

type GlobalModifier = {
  id: string;
  name: string;
  description: string | null;
  type: ModifierType;
  priceDeltaCents: number | null;
  sortOrder: number;
};

type PackageModifierAssignment = {
  id: string;
  modifierId: string;
  isIncluded: boolean;
  isRequired: boolean;
  sortOrder: number;
  modifier: GlobalModifier;
};

type PackageData = {
  id: string;
  name: string;
  slug: string;
  summaryLine: string | null;
  description: string | null;
  durationMinutes: number | null;
  deliverables: string[];
  notes: string | null;
  basePriceCents: number | null;
  sortOrder: number;
  status: PackageStatus;
  modifiers: PackageModifierAssignment[];
};

type PackageEditorProps = {
  pkg: PackageData;
  allModifiers: GlobalModifier[];
};

const centsToDisplay = (cents: number | null): string => {
  if (cents == null) return '';
  return (cents / 100).toFixed(2);
};

const displayToCents = (val: string): number | undefined => {
  const parsed = parseFloat(val);
  return isNaN(parsed) ? undefined : Math.round(parsed * 100);
};

const filterDecimal = (val: string): string => {
  let out = val.replace(/[^0-9.\-]/g, '');
  out = out.replace(/(?!^)-/g, '');
  const dotIdx = out.indexOf('.');
  if (dotIdx !== -1) out = out.slice(0, dotIdx + 1) + out.slice(dotIdx + 1).replace(/\./g, '');
  return out;
};

const filterNonNegInt = (val: string): string => val.replace(/[^0-9]/g, '');

// ── Assignment form (per-package settings for an assigned modifier) ────────────

type AssignmentFormState = {
  isIncluded: boolean;
  isRequired: boolean;
  sortOrder: string;
};

const emptyAssignmentForm = (): AssignmentFormState => ({
  isIncluded: false,
  isRequired: false,
  sortOrder: '0'
});

const assignmentToForm = (a: PackageModifierAssignment): AssignmentFormState => ({
  isIncluded: a.isIncluded,
  isRequired: a.isRequired,
  sortOrder: String(a.sortOrder)
});

// ── Main editor ───────────────────────────────────────────────────────────────

const PackageEditor = ({ pkg: initialPkg, allModifiers }: PackageEditorProps) => {
  const [pkg, setPkg] = useState(initialPkg);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [detailsForm, setDetailsForm] = useState({
    name: initialPkg.name,
    slug: initialPkg.slug,
    summaryLine: initialPkg.summaryLine ?? '',
    description: initialPkg.description ?? '',
    durationMinutes: initialPkg.durationMinutes != null ? String(initialPkg.durationMinutes) : '',
    deliverables: initialPkg.deliverables.join('\n'),
    notes: initialPkg.notes ?? '',
    basePriceDollars: centsToDisplay(initialPkg.basePriceCents),
    sortOrder: String(initialPkg.sortOrder)
  });

  const assignedIds = new Set(pkg.modifiers.map((a) => a.modifierId));
  const unassignedModifiers = allModifiers.filter((m) => !assignedIds.has(m.id));

  const [selectedModifierId, setSelectedModifierId] = useState<string>('');
  const [addAssignForm, setAddAssignForm] = useState<AssignmentFormState>(emptyAssignmentForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<AssignmentFormState>(emptyAssignmentForm());

  const setFeedback = (msg: string | null, err: string | null = null) => {
    setMessage(msg);
    setError(err);
  };

  // ── Package details ─────────────────────────────────────────────────────────

  const updateDetails = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    const response = await fetch(`/api/packages/${pkg.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: detailsForm.name,
        slug: detailsForm.slug,
        summaryLine: detailsForm.summaryLine || undefined,
        description: detailsForm.description || undefined,
        durationMinutes: detailsForm.durationMinutes
          ? parseInt(detailsForm.durationMinutes, 10)
          : undefined,
        deliverables: detailsForm.deliverables
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        notes: detailsForm.notes || undefined,
        basePriceCents: displayToCents(detailsForm.basePriceDollars),
        sortOrder: parseInt(detailsForm.sortOrder, 10) || 0
      })
    });

    const payload = await response.json();

    if (!payload.ok) {
      setFeedback(null, payload.error?.message ?? 'Unable to update package.');
      return;
    }

    setPkg((prev) => ({ ...prev, ...payload.data }));
    setFeedback('Package details updated.');
  };

  // ── Status ──────────────────────────────────────────────────────────────────

  const updateStatus = async () => {
    setFeedback(null);

    const response = await fetch(`/api/packages/${pkg.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: pkg.status })
    });

    const payload = await response.json();

    if (!payload.ok) {
      setFeedback(null, payload.error?.message ?? 'Unable to update status.');
      return;
    }

    setPkg((prev) => ({ ...prev, status: payload.data.status }));
    setFeedback('Status updated.');
  };

  // ── Assign modifier ─────────────────────────────────────────────────────────

  const assignModifier = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (!selectedModifierId) return;

    const response = await fetch(`/api/packages/${pkg.id}/modifiers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modifierId: selectedModifierId,
        isIncluded: addAssignForm.isIncluded,
        isRequired: addAssignForm.isRequired,
        sortOrder: parseInt(addAssignForm.sortOrder, 10) || 0
      })
    });

    const payload = await response.json();

    if (!payload.ok) {
      setFeedback(null, payload.error?.message ?? 'Unable to assign modifier.');
      return;
    }

    setPkg((prev) => ({ ...prev, modifiers: [...prev.modifiers, payload.data] }));
    setSelectedModifierId('');
    setAddAssignForm(emptyAssignmentForm());
    setFeedback('Modifier assigned.');
  };

  // ── Edit assignment ─────────────────────────────────────────────────────────

  const startEdit = (assignment: PackageModifierAssignment) => {
    setEditingId(assignment.id);
    setEditForm(assignmentToForm(assignment));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyAssignmentForm());
  };

  const saveEdit = async (assignmentId: string) => {
    setFeedback(null);

    const response = await fetch(`/api/packages/${pkg.id}/modifiers/${assignmentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isIncluded: editForm.isIncluded,
        isRequired: editForm.isRequired,
        sortOrder: parseInt(editForm.sortOrder, 10) || 0
      })
    });

    const payload = await response.json();

    if (!payload.ok) {
      setFeedback(null, payload.error?.message ?? 'Unable to update assignment.');
      return;
    }

    setPkg((prev) => ({
      ...prev,
      modifiers: prev.modifiers.map((a) => (a.id === assignmentId ? payload.data : a))
    }));
    setEditingId(null);
    setFeedback('Assignment updated.');
  };

  // ── Remove assignment ───────────────────────────────────────────────────────

  const removeModifier = async (assignmentId: string) => {
    setFeedback(null);

    const response = await fetch(`/api/packages/${pkg.id}/modifiers/${assignmentId}`, {
      method: 'DELETE'
    });

    const payload = await response.json();

    if (!payload.ok) {
      setFeedback(null, payload.error?.message ?? 'Unable to remove modifier.');
      return;
    }

    setPkg((prev) => ({
      ...prev,
      modifiers: prev.modifiers.filter((a) => a.id !== assignmentId)
    }));
    setFeedback('Modifier removed.');
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* Package details */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Package details</h2>
        <form onSubmit={updateDetails} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Name
              <input
                value={detailsForm.name}
                onChange={(e) => setDetailsForm((prev) => ({ ...prev, name: e.target.value }))}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Slug
              <input
                value={detailsForm.slug}
                onChange={(e) => setDetailsForm((prev) => ({ ...prev, slug: e.target.value }))}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                required
              />
            </label>
          </div>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Summary line
            <input
              value={detailsForm.summaryLine}
              onChange={(e) => setDetailsForm((prev) => ({ ...prev, summaryLine: e.target.value }))}
              placeholder="One-liner shown on cards (e.g. 'Perfect for couples and small families')"
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              maxLength={200}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Description
            <textarea
              value={detailsForm.description}
              onChange={(e) => setDetailsForm((prev) => ({ ...prev, description: e.target.value }))}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              rows={3}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Deliverables
            <textarea
              value={detailsForm.deliverables}
              onChange={(e) =>
                setDetailsForm((prev) => ({ ...prev, deliverables: e.target.value }))
              }
              placeholder="One deliverable per line, e.g.&#10;40 edited photos&#10;2-hour session&#10;Online gallery delivery"
              className="rounded-md border border-slate-200 px-3 py-2 text-sm font-mono"
              rows={4}
            />
            <span className="text-xs text-slate-400">One item per line.</span>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Notes
            <textarea
              value={detailsForm.notes}
              onChange={(e) => setDetailsForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Caveats, fine print, or anything the client should know"
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              rows={2}
            />
          </label>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Duration (minutes)
              <input
                value={detailsForm.durationMinutes}
                onChange={(e) =>
                  setDetailsForm((prev) => ({
                    ...prev,
                    durationMinutes: filterNonNegInt(e.target.value)
                  }))
                }
                placeholder="e.g. 120"
                className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                inputMode="numeric"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Base price ($)
              <input
                value={detailsForm.basePriceDollars}
                onChange={(e) =>
                  setDetailsForm((prev) => ({
                    ...prev,
                    basePriceDollars: filterDecimal(e.target.value)
                  }))
                }
                placeholder="e.g. 350"
                className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                inputMode="decimal"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Sort order
              <input
                value={detailsForm.sortOrder}
                onChange={(e) => setDetailsForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                inputMode="numeric"
              />
            </label>
          </div>

          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Save details
          </button>
        </form>
      </section>

      {/* Status */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Status</h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <select
            value={pkg.status}
            onChange={(e) =>
              setPkg((prev) => ({ ...prev, status: e.target.value as PackageStatus }))
            }
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={updateStatus}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Update status
          </button>
          <span className="text-sm text-slate-500">Current: {pkg.status}</span>
        </div>
      </section>

      {/* Modifiers */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Modifiers</h2>
            <p className="mt-1 text-sm text-slate-500">
              Assign modifiers from the global library. Sort order controls display sequence.
            </p>
          </div>
          <Link
            href="/modifiers"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Manage library →
          </Link>
        </div>

        {/* Assigned modifiers */}
        <div className="mt-5 space-y-3">
          {pkg.modifiers.length === 0 ? (
            <p className="text-sm text-slate-500">No modifiers assigned yet.</p>
          ) : (
            pkg.modifiers.map((assignment) =>
              editingId === assignment.id ? (
                // ── Inline edit assignment settings ───────────────────────────
                <div
                  key={assignment.id}
                  className="rounded-md border border-indigo-200 bg-indigo-50 p-4"
                >
                  <p className="mb-3 text-sm font-semibold text-slate-700">
                    {assignment.modifier.name}
                    <span className="ml-2 text-xs font-normal text-slate-400">
                      {assignment.modifier.type}
                    </span>
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                      Sort order
                      <input
                        value={editForm.sortOrder}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            sortOrder: e.target.value.replace(/[^0-9]/g, '')
                          }))
                        }
                        className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                        inputMode="numeric"
                      />
                    </label>
                    <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={editForm.isIncluded}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, isIncluded: e.target.checked }))
                        }
                      />
                      Included
                    </label>
                    <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={editForm.isRequired}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, isRequired: e.target.checked }))
                        }
                      />
                      Required
                    </label>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => saveEdit(assignment.id)}
                      className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // ── Read row ──────────────────────────────────────────────────
                <div
                  key={assignment.id}
                  className="flex flex-wrap items-start justify-between gap-4 rounded-md border border-slate-100 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">
                      {assignment.modifier.name}
                      <span className="ml-2 text-xs font-normal text-slate-400">
                        {assignment.modifier.type}
                      </span>
                      {assignment.isIncluded && (
                        <span className="ml-1 text-xs font-normal text-emerald-600">included</span>
                      )}
                      {assignment.isRequired && (
                        <span className="ml-1 text-xs font-normal text-slate-400">required</span>
                      )}
                    </p>
                    {assignment.modifier.description && (
                      <p className="text-xs text-slate-500">{assignment.modifier.description}</p>
                    )}
                    {assignment.modifier.priceDeltaCents != null && (
                      <p className="text-xs text-slate-500">
                        {assignment.modifier.priceDeltaCents >= 0 ? '+' : ''}$
                        {(assignment.modifier.priceDeltaCents / 100).toFixed(2)}
                      </p>
                    )}
                    <p className="text-xs text-slate-400">order: {assignment.sortOrder}</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => startEdit(assignment)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => removeModifier(assignment.id)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-500"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            )
          )}
        </div>

        {/* Assign from library */}
        <div className="mt-6 border-t border-slate-100 pt-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Assign from library</h3>
          {unassignedModifiers.length === 0 ? (
            <p className="text-sm text-slate-500">
              All library modifiers are assigned.{' '}
              <Link href="/modifiers/new" className="text-indigo-600 hover:text-indigo-500">
                Add more to the library
              </Link>
              .
            </p>
          ) : (
            <form onSubmit={assignModifier} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="col-span-2 flex flex-col gap-1 sm:col-span-1">
                  <label className="text-sm font-medium text-slate-700">Modifier</label>
                  <select
                    value={selectedModifierId}
                    onChange={(e) => setSelectedModifierId(e.target.value)}
                    className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select…</option>
                    {unassignedModifiers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.type})
                      </option>
                    ))}
                  </select>
                </div>
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                  Sort order
                  <input
                    value={addAssignForm.sortOrder}
                    onChange={(e) =>
                      setAddAssignForm((prev) => ({
                        ...prev,
                        sortOrder: e.target.value.replace(/[^0-9]/g, '')
                      }))
                    }
                    className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                    inputMode="numeric"
                  />
                </label>
                <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={addAssignForm.isIncluded}
                    onChange={(e) =>
                      setAddAssignForm((prev) => ({ ...prev, isIncluded: e.target.checked }))
                    }
                  />
                  Included
                </label>
                <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={addAssignForm.isRequired}
                    onChange={(e) =>
                      setAddAssignForm((prev) => ({ ...prev, isRequired: e.target.checked }))
                    }
                  />
                  Required
                </label>
              </div>
              <button
                type="submit"
                className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Assign modifier
              </button>
            </form>
          )}
        </div>
      </section>

      {(message || error) && (
        <div
          className={`rounded-md border px-4 py-2 text-sm ${
            error
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          {error ?? message}
        </div>
      )}
    </div>
  );
};

export default PackageEditor;
