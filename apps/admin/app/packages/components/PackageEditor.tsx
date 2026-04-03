'use client';

import { useState } from 'react';

import type { ModifierType, SliderConfig, ToggleConfig, IncrementerConfig } from '@repo/core';
import { useToast } from '../../components/Toaster';

const statusOptions = ['DRAFT', 'ACTIVE', 'ARCHIVED'] as const;
type PackageStatus = (typeof statusOptions)[number];

const modifierTypeOptions: ModifierType[] = ['CHECKBOX', 'TOGGLE', 'SLIDER', 'INCREMENTER'];

type ModifierConfig = ToggleConfig | SliderConfig | IncrementerConfig | null;

type PackageModifier = {
  id: string;
  name: string;
  description: string | null;
  type: ModifierType;
  isIncluded: boolean;
  isRequired: boolean;
  priceDeltaCents: number | null;
  config: unknown;
  sortOrder: number;
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
  modifiers: PackageModifier[];
};

type PackageEditorProps = {
  pkg: PackageData;
};

const centsToDisplay = (cents: number | null): string => {
  if (cents == null) return '';
  return (cents / 100).toFixed(2);
};

const displayToCents = (val: string): number | undefined => {
  const parsed = parseFloat(val);
  return isNaN(parsed) ? undefined : Math.round(parsed * 100);
};

// Restrict a price field to an optional leading minus, digits, and one decimal point.
const filterDecimal = (val: string): string => {
  // Strip everything except digits, minus, and dot
  let out = val.replace(/[^0-9.\-]/g, '');
  // Minus only at position 0
  out = out.replace(/(?!^)-/g, '');
  // Only one decimal point
  const dotIdx = out.indexOf('.');
  if (dotIdx !== -1) out = out.slice(0, dotIdx + 1) + out.slice(dotIdx + 1).replace(/\./g, '');
  return out;
};

// Restrict a field to non-negative integers only.
const filterNonNegInt = (val: string): string => val.replace(/[^0-9]/g, '');

// Modifier form validation — returns a map of field → error string.
type ModifierFormErrors = Partial<Record<keyof ModifierFormState, string>>;

const validateModifierForm = (form: ModifierFormState): ModifierFormErrors => {
  const errors: ModifierFormErrors = {};

  if (!form.name.trim()) errors.name = 'Required.';
  else if (form.name.trim().length < 2) errors.name = 'At least 2 characters.';

  if (form.priceDeltaDollars !== '' && isNaN(parseFloat(form.priceDeltaDollars))) {
    errors.priceDeltaDollars = 'Must be a number.';
  }

  const sortInt = parseInt(form.sortOrder, 10);
  if (form.sortOrder !== '' && (isNaN(sortInt) || sortInt < 0)) {
    errors.sortOrder = 'Must be 0 or greater.';
  }

  return errors;
};

// ── Modifier config form fields ───────────────────────────────────────────────

const ToggleConfigFields = ({
  config,
  onChange
}: {
  config: Partial<ToggleConfig>;
  onChange: (c: Partial<ToggleConfig>) => void;
}) => (
  <div className="grid grid-cols-2 gap-3">
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
      Default label
      <input
        value={config.defaultLabel ?? ''}
        onChange={(e) => onChange({ ...config, defaultLabel: e.target.value })}
        placeholder="e.g. Regular editing"
        className="rounded-md border border-slate-200 px-3 py-2 text-sm"
      />
    </label>
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
      Alt label
      <input
        value={config.altLabel ?? ''}
        onChange={(e) => onChange({ ...config, altLabel: e.target.value })}
        placeholder="e.g. Light editing"
        className="rounded-md border border-slate-200 px-3 py-2 text-sm"
      />
    </label>
  </div>
);

const SliderConfigFields = ({
  config,
  onChange
}: {
  config: Partial<SliderConfig>;
  onChange: (c: Partial<SliderConfig>) => void;
}) => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
    {(
      [
        { key: 'min', label: 'Min', placeholder: '0' },
        { key: 'max', label: 'Max', placeholder: '100' },
        { key: 'defaultValue', label: 'Default', placeholder: '40' },
        { key: 'step', label: 'Step', placeholder: '10' }
      ] as { key: keyof SliderConfig; label: string; placeholder: string }[]
    ).map(({ key, label, placeholder }) => (
      <label key={key} className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        {label}
        <input
          value={config[key] != null ? String(config[key]) : ''}
          onChange={(e) => {
            const filtered = filterNonNegInt(e.target.value);
            const n = parseInt(filtered, 10);
            onChange({ ...config, [key]: isNaN(n) ? undefined : n });
          }}
          placeholder={placeholder}
          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
          inputMode="numeric"
        />
      </label>
    ))}
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
      Price/step ($)
      <input
        value={config.pricePerStep != null ? String(config.pricePerStep / 100) : ''}
        onChange={(e) => {
          const filtered = filterDecimal(e.target.value);
          const n = parseFloat(filtered);
          onChange({ ...config, pricePerStep: isNaN(n) ? undefined : Math.round(n * 100) });
        }}
        placeholder="e.g. 5 or -3"
        className="rounded-md border border-slate-200 px-3 py-2 text-sm"
        inputMode="decimal"
      />
    </label>
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
      Unit
      <input
        value={config.unit ?? ''}
        onChange={(e) => onChange({ ...config, unit: e.target.value })}
        placeholder="e.g. photos"
        className="rounded-md border border-slate-200 px-3 py-2 text-sm"
      />
    </label>
  </div>
);

const IncrementerConfigFields = ({
  config,
  onChange
}: {
  config: Partial<IncrementerConfig>;
  onChange: (c: Partial<IncrementerConfig>) => void;
}) => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
    {(
      [
        { key: 'min', label: 'Min', placeholder: '0' },
        { key: 'max', label: 'Max', placeholder: '5' },
        { key: 'defaultValue', label: 'Default', placeholder: '0' }
      ] as { key: keyof IncrementerConfig; label: string; placeholder: string }[]
    ).map(({ key, label, placeholder }) => (
      <label key={key} className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        {label}
        <input
          value={config[key] != null ? String(config[key]) : ''}
          onChange={(e) => {
            const filtered = filterNonNegInt(e.target.value);
            const n = parseInt(filtered, 10);
            onChange({ ...config, [key]: isNaN(n) ? undefined : n });
          }}
          placeholder={placeholder}
          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
          inputMode="numeric"
        />
      </label>
    ))}
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
      Price/unit ($)
      <input
        value={config.pricePerUnit != null ? String(config.pricePerUnit / 100) : ''}
        onChange={(e) => {
          const filtered = filterDecimal(e.target.value);
          const n = parseFloat(filtered);
          onChange({ ...config, pricePerUnit: isNaN(n) ? undefined : Math.round(n * 100) });
        }}
        placeholder="e.g. 80"
        className="rounded-md border border-slate-200 px-3 py-2 text-sm"
        inputMode="decimal"
      />
    </label>
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
      Unit
      <input
        value={config.unit ?? ''}
        onChange={(e) => onChange({ ...config, unit: e.target.value })}
        placeholder="e.g. albums"
        className="rounded-md border border-slate-200 px-3 py-2 text-sm"
      />
    </label>
  </div>
);

// ── Blank config per type ─────────────────────────────────────────────────────

const blankConfig = (
  type: ModifierType
): Partial<ToggleConfig> | Partial<SliderConfig> | Partial<IncrementerConfig> | null => {
  switch (type) {
    case 'TOGGLE':
      return { defaultLabel: '', altLabel: '' };
    case 'SLIDER':
      return {};
    case 'INCREMENTER':
      return {};
    case 'CHECKBOX':
      return null;
  }
};

// ── Inline modifier form (shared by add + edit) ───────────────────────────────

type ModifierFormState = {
  name: string;
  description: string;
  type: ModifierType;
  isIncluded: boolean;
  isRequired: boolean;
  priceDeltaDollars: string;
  config: Partial<ToggleConfig> | Partial<SliderConfig> | Partial<IncrementerConfig> | null;
  sortOrder: string;
};

const emptyModifierForm = (): ModifierFormState => ({
  name: '',
  description: '',
  type: 'CHECKBOX',
  isIncluded: false,
  isRequired: false,
  priceDeltaDollars: '',
  config: null,
  sortOrder: '0'
});

const modifierToForm = (m: PackageModifier): ModifierFormState => ({
  name: m.name,
  description: m.description ?? '',
  type: m.type,
  isIncluded: m.isIncluded,
  isRequired: m.isRequired,
  priceDeltaDollars: centsToDisplay(m.priceDeltaCents),
  config: m.config as ModifierFormState['config'],
  sortOrder: String(m.sortOrder)
});

const formToPayload = (form: ModifierFormState) => ({
  name: form.name,
  description: form.description || undefined,
  type: form.type,
  isIncluded: form.isIncluded,
  isRequired: form.isRequired,
  priceDeltaCents: displayToCents(form.priceDeltaDollars),
  config: form.config && Object.keys(form.config).length > 0 ? form.config : undefined,
  sortOrder: parseInt(form.sortOrder, 10) || 0
});

const ModifierFormFields = ({
  form,
  onChange,
  errors = {}
}: {
  form: ModifierFormState;
  onChange: (f: ModifierFormState) => void;
  errors?: ModifierFormErrors;
}) => {
  const set = <K extends keyof ModifierFormState>(key: K, val: ModifierFormState[K]) =>
    onChange({ ...form, [key]: val });

  const handleTypeChange = (type: ModifierType) => {
    onChange({ ...form, type, config: blankConfig(type) });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Name</label>
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            className={`rounded-md border px-3 py-2 text-sm ${errors.name ? 'border-rose-400' : 'border-slate-200'}`}
            required
          />
          {errors.name && <p className="text-xs text-rose-600">{errors.name}</p>}
        </div>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Type
          <select
            value={form.type}
            onChange={(e) => handleTypeChange(e.target.value as ModifierType)}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
          >
            {modifierTypeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Description
        <input
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
        />
      </label>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(form.type === 'CHECKBOX' || form.type === 'TOGGLE') && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Price delta ($)</label>
            <input
              value={form.priceDeltaDollars}
              onChange={(e) => set('priceDeltaDollars', filterDecimal(e.target.value))}
              placeholder="e.g. 50 or -25"
              className={`rounded-md border px-3 py-2 text-sm ${errors.priceDeltaDollars ? 'border-rose-400' : 'border-slate-200'}`}
              inputMode="decimal"
            />
            {errors.priceDeltaDollars && (
              <p className="text-xs text-rose-600">{errors.priceDeltaDollars}</p>
            )}
          </div>
        )}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Sort order</label>
          <input
            value={form.sortOrder}
            onChange={(e) => set('sortOrder', filterNonNegInt(e.target.value))}
            className={`rounded-md border px-3 py-2 text-sm ${errors.sortOrder ? 'border-rose-400' : 'border-slate-200'}`}
            inputMode="numeric"
          />
          {errors.sortOrder && <p className="text-xs text-rose-600">{errors.sortOrder}</p>}
        </div>
        <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={form.isIncluded}
            onChange={(e) => set('isIncluded', e.target.checked)}
          />
          Included by default
        </label>
        <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={form.isRequired}
            onChange={(e) => set('isRequired', e.target.checked)}
          />
          Required (locked)
        </label>
      </div>

      {form.type === 'TOGGLE' && (
        <div className="rounded-md border border-slate-100 bg-slate-50 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Toggle options
          </p>
          <ToggleConfigFields
            config={(form.config as Partial<ToggleConfig>) ?? {}}
            onChange={(c) => set('config', c)}
          />
        </div>
      )}

      {form.type === 'SLIDER' && (
        <div className="rounded-md border border-slate-100 bg-slate-50 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Slider config
          </p>
          <SliderConfigFields
            config={(form.config as Partial<SliderConfig>) ?? {}}
            onChange={(c) => set('config', c)}
          />
        </div>
      )}

      {form.type === 'INCREMENTER' && (
        <div className="rounded-md border border-slate-100 bg-slate-50 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Incrementer config
          </p>
          <IncrementerConfigFields
            config={(form.config as Partial<IncrementerConfig>) ?? {}}
            onChange={(c) => set('config', c)}
          />
        </div>
      )}
    </div>
  );
};

// ── Main editor ───────────────────────────────────────────────────────────────

const PackageEditor = ({ pkg: initialPkg }: PackageEditorProps) => {
  const [pkg, setPkg] = useState(initialPkg);
  const { addToast } = useToast();

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

  const [addForm, setAddForm] = useState<ModifierFormState>(emptyModifierForm);
  const [addErrors, setAddErrors] = useState<ModifierFormErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ModifierFormState>(emptyModifierForm);
  const [editErrors, setEditErrors] = useState<ModifierFormErrors>({});

  // ── Package details ─────────────────────────────────────────────────────────

  const updateDetails = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
      addToast(payload.error?.message ?? 'Unable to update package.', 'error');
      return;
    }

    setPkg((prev) => ({ ...prev, ...payload.data }));
    addToast('Package details updated.', 'success');
  };

  // ── Status ──────────────────────────────────────────────────────────────────

  const updateStatus = async () => {
    const response = await fetch(`/api/packages/${pkg.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: pkg.status })
    });

    const payload = await response.json();

    if (!payload.ok) {
      addToast(payload.error?.message ?? 'Unable to update status.', 'error');
      return;
    }

    setPkg((prev) => ({ ...prev, status: payload.data.status }));
    addToast('Status updated.', 'success');
  };

  // ── Add modifier ────────────────────────────────────────────────────────────

  const addModifier = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validateModifierForm(addForm);
    if (Object.keys(errors).length > 0) {
      setAddErrors(errors);
      return;
    }
    setAddErrors({});

    const response = await fetch(`/api/packages/${pkg.id}/modifiers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageId: pkg.id, ...formToPayload(addForm) })
    });

    const payload = await response.json();

    if (!payload.ok) {
      addToast(payload.error?.message ?? 'Unable to add modifier.', 'error');
      return;
    }

    setPkg((prev) => ({ ...prev, modifiers: [...prev.modifiers, payload.data] }));
    setAddForm(emptyModifierForm());
    addToast('Modifier added.', 'success');
  };

  // ── Edit modifier ───────────────────────────────────────────────────────────

  const startEdit = (modifier: PackageModifier) => {
    setEditingId(modifier.id);
    setEditForm(modifierToForm(modifier));
    setEditErrors({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyModifierForm());
    setEditErrors({});
  };

  const saveEdit = async (modifierId: string) => {
    const errors = validateModifierForm(editForm);
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }
    setEditErrors({});

    const response = await fetch(`/api/packages/${pkg.id}/modifiers/${modifierId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formToPayload(editForm))
    });

    const payload = await response.json();

    if (!payload.ok) {
      addToast(payload.error?.message ?? 'Unable to update modifier.', 'error');
      return;
    }

    setPkg((prev) => ({
      ...prev,
      modifiers: prev.modifiers.map((m) => (m.id === modifierId ? payload.data : m))
    }));
    setEditingId(null);
    addToast('Modifier updated.', 'success');
  };

  // ── Remove modifier ─────────────────────────────────────────────────────────

  const removeModifier = async (modifierId: string) => {
    const response = await fetch(`/api/packages/${pkg.id}/modifiers/${modifierId}`, {
      method: 'DELETE'
    });

    const payload = await response.json();

    if (!payload.ok) {
      addToast(payload.error?.message ?? 'Unable to remove modifier.', 'error');
      return;
    }

    setPkg((prev) => ({
      ...prev,
      modifiers: prev.modifiers.filter((m) => m.id !== modifierId)
    }));
    addToast('Modifier removed.', 'success');
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
        <h2 className="text-lg font-semibold text-slate-900">Modifiers</h2>
        <p className="mt-1 text-sm text-slate-500">
          Add-ons and options that modify this package. Sort order controls display sequence.
        </p>

        {/* Existing modifiers */}
        <div className="mt-5 space-y-3">
          {pkg.modifiers.length === 0 ? (
            <p className="text-sm text-slate-500">No modifiers yet.</p>
          ) : (
            pkg.modifiers.map((modifier) =>
              editingId === modifier.id ? (
                // ── Inline edit form ──────────────────────────────────────────
                <div
                  key={modifier.id}
                  className="rounded-md border border-indigo-200 bg-indigo-50 p-4"
                >
                  <ModifierFormFields form={editForm} onChange={setEditForm} errors={editErrors} />
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => saveEdit(modifier.id)}
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
                  key={modifier.id}
                  className="flex flex-wrap items-start justify-between gap-4 rounded-md border border-slate-100 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">
                      {modifier.name}
                      <span className="ml-2 text-xs font-normal text-slate-400">
                        {modifier.type}
                      </span>
                      {modifier.isIncluded && (
                        <span className="ml-1 text-xs font-normal text-emerald-600">included</span>
                      )}
                      {modifier.isRequired && (
                        <span className="ml-1 text-xs font-normal text-slate-400">required</span>
                      )}
                    </p>
                    {modifier.description && (
                      <p className="text-xs text-slate-500">{modifier.description}</p>
                    )}
                    {modifier.priceDeltaCents != null && (
                      <p className="text-xs text-slate-500">
                        {modifier.priceDeltaCents >= 0 ? '+' : ''}$
                        {(modifier.priceDeltaCents / 100).toFixed(2)}
                      </p>
                    )}
                    <p className="text-xs text-slate-400">order: {modifier.sortOrder}</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => startEdit(modifier)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => removeModifier(modifier.id)}
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

        {/* Add new modifier */}
        <div className="mt-6 border-t border-slate-100 pt-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Add modifier</h3>
          <form onSubmit={addModifier} className="space-y-4">
            <ModifierFormFields form={addForm} onChange={setAddForm} errors={addErrors} />
            <button
              type="submit"
              className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Add modifier
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default PackageEditor;
