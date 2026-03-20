'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type { IncrementerConfig, ModifierType, SliderConfig, ToggleConfig } from '@repo/core';

const modifierTypeOptions: ModifierType[] = ['CHECKBOX', 'TOGGLE', 'SLIDER', 'INCREMENTER'];

const filterDecimal = (val: string): string => {
  let out = val.replace(/[^0-9.\-]/g, '');
  out = out.replace(/(?!^)-/g, '');
  const dotIdx = out.indexOf('.');
  if (dotIdx !== -1) out = out.slice(0, dotIdx + 1) + out.slice(dotIdx + 1).replace(/\./g, '');
  return out;
};

const filterNonNegInt = (val: string): string => val.replace(/[^0-9]/g, '');

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
            const n = parseInt(filterNonNegInt(e.target.value), 10);
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
          const n = parseFloat(filterDecimal(e.target.value));
          onChange({ ...config, pricePerStep: isNaN(n) ? undefined : Math.round(n * 100) });
        }}
        placeholder="e.g. 5"
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
            const n = parseInt(filterNonNegInt(e.target.value), 10);
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
          const n = parseFloat(filterDecimal(e.target.value));
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

type ModifierData = {
  id: string;
  name: string;
  description: string | null;
  type: ModifierType;
  priceDeltaCents: number | null;
  config: unknown;
  sortOrder: number;
};

type FormState = {
  name: string;
  description: string;
  type: ModifierType;
  priceDeltaDollars: string;
  config: Partial<ToggleConfig> | Partial<SliderConfig> | Partial<IncrementerConfig> | null;
  sortOrder: string;
};

const modifierToForm = (m: ModifierData): FormState => ({
  name: m.name,
  description: m.description ?? '',
  type: m.type,
  priceDeltaDollars: m.priceDeltaCents != null ? (m.priceDeltaCents / 100).toFixed(2) : '',
  config: m.config as FormState['config'],
  sortOrder: String(m.sortOrder)
});

const blankConfig = (
  type: ModifierType
): Partial<ToggleConfig> | Partial<SliderConfig> | Partial<IncrementerConfig> | null => {
  switch (type) {
    case 'TOGGLE':
      return { defaultLabel: '', altLabel: '' };
    case 'SLIDER':
    case 'INCREMENTER':
      return {};
    case 'CHECKBOX':
      return null;
  }
};

const ModifierEditor = ({ modifier: initial }: { modifier: ModifierData }) => {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(modifierToForm(initial));
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleTypeChange = (type: ModifierType) => {
    setForm((prev) => ({ ...prev, type, config: blankConfig(type) }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);

    const priceDelta = parseFloat(form.priceDeltaDollars);

    const response = await fetch(`/api/modifiers/${initial.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        description: form.description || undefined,
        type: form.type,
        priceDeltaCents:
          form.priceDeltaDollars !== '' && !isNaN(priceDelta)
            ? Math.round(priceDelta * 100)
            : undefined,
        config: form.config && Object.keys(form.config).length > 0 ? form.config : undefined,
        sortOrder: parseInt(form.sortOrder, 10) || 0
      })
    });

    const payload = await response.json();
    setSaving(false);

    if (!payload.ok) {
      setError(payload.error?.message ?? 'Unable to update modifier.');
      return;
    }

    setMessage('Modifier updated.');
  };

  const handleDelete = async () => {
    if (!confirm('Delete this modifier? It will be removed from all packages.')) return;
    setDeleting(true);

    const response = await fetch(`/api/modifiers/${initial.id}`, { method: 'DELETE' });
    const payload = await response.json();
    setDeleting(false);

    if (!payload.ok) {
      setError(payload.error?.message ?? 'Unable to delete modifier.');
      return;
    }

    router.push('/modifiers');
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSave}
        className="space-y-5 rounded-lg border border-slate-200 bg-white p-6"
      >
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Name
            <input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              required
              minLength={2}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
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

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Description
          <input
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          {(form.type === 'CHECKBOX' || form.type === 'TOGGLE') && (
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              Price delta ($)
              <input
                value={form.priceDeltaDollars}
                onChange={(e) => set('priceDeltaDollars', filterDecimal(e.target.value))}
                placeholder="e.g. 50 or -25"
                className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                inputMode="decimal"
              />
            </label>
          )}
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Sort order
            <input
              value={form.sortOrder}
              onChange={(e) => set('sortOrder', filterNonNegInt(e.target.value))}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              inputMode="numeric"
            />
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

        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>

      <div className="rounded-lg border border-rose-100 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Delete modifier</h2>
        <p className="mt-1 text-sm text-slate-500">
          Permanently deletes this modifier and removes it from all packages.
        </p>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="mt-4 rounded-md border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleting ? 'Deleting…' : 'Delete modifier'}
        </button>
      </div>

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

export default ModifierEditor;
