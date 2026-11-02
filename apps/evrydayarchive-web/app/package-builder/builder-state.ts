import type {
  IncrementerConfig,
  ModifierType,
  PublicModifierConfig,
  PublicPackage,
  PublicPackageModifier,
  SliderConfig
} from '@repo/core';
// Subpath import keeps the core package's Zod schemas out of the client bundle.
import {
  activeModifierDeltaCents,
  type ModifierSelection,
  type PricedModifier
} from '@repo/core/pricing';

// ── Control state ─────────────────────────────────────────────────────────────

export type CheckboxState = { type: 'checkbox'; checked: boolean };
export type ToggleState = { type: 'toggle'; altSelected: boolean };
export type SliderState = { type: 'slider'; value: number };
export type IncrementerState = { type: 'incrementer'; count: number };

export type ControlState = CheckboxState | ToggleState | SliderState | IncrementerState;

export type BuilderItem = {
  id: string;
  name: string;
  description: string | null;
  modifierType: ModifierType;
  isRequired: boolean;
  isIncluded: boolean;
  priceDeltaCents: number | null;
  config: PublicModifierConfig;
  control: ControlState;
};

// ── Pricing adapters ──────────────────────────────────────────────────────────
// Pricing rules live in @repo/core; these adapt builder control state to them.

const toPricedModifier = (item: BuilderItem): PricedModifier => ({
  id: item.id,
  name: item.name,
  type: item.modifierType,
  isRequired: item.isRequired,
  priceDeltaCents: item.priceDeltaCents,
  config: item.config
});

// Checked checkboxes and alt-selected toggles are "selected"; sliders and
// incrementers report their values. Same shape /book receives in the URL.
export const toSelection = (items: BuilderItem[]): ModifierSelection => {
  const selectedIds: string[] = [];
  const values: Record<string, number> = {};
  for (const item of items) {
    const { control } = item;
    if (control.type === 'checkbox' && control.checked && !item.isRequired) {
      selectedIds.push(item.id);
    }
    if (control.type === 'toggle' && control.altSelected && !item.isRequired) {
      selectedIds.push(item.id);
    }
    if (control.type === 'slider') values[item.id] = control.value;
    if (control.type === 'incrementer') values[item.id] = control.count;
  }
  return { selectedIds, values };
};

export const itemPriceDelta = (item: BuilderItem): number =>
  activeModifierDeltaCents(toPricedModifier(item), toSelection([item]));

/** The summary's add-on lines: every item currently changing the price. */
export const priceLines = (items: BuilderItem[]): { name: string; deltaCents: number }[] =>
  items
    .map((item) => ({ name: item.name, deltaCents: itemPriceDelta(item) }))
    .filter((line) => line.deltaCents !== 0);

// ── Cross-modifier constraints ────────────────────────────────────────────────
// If any "location" modifier is active, the first time-unit SLIDER must be >= 90 min.

const LOCATION_MIN_MINUTES = 90;

const isLocationActive = (items: BuilderItem[]): boolean =>
  items.some((item) => {
    if (!item.name.toLowerCase().includes('location')) return false;
    const { control } = item;
    if (control.type === 'checkbox') return control.checked;
    if (control.type === 'toggle') return control.altSelected;
    return false;
  });

const isTimeSlider = (item: BuilderItem): boolean => {
  if (item.control.type !== 'slider') return false;
  const cfg = item.config as SliderConfig;
  return (
    cfg?.unit?.toLowerCase().includes('min') ||
    item.name.toLowerCase().includes('duration') ||
    item.name.toLowerCase().includes('time')
  );
};

export const applyConstraints = (items: BuilderItem[]): BuilderItem[] => {
  if (!isLocationActive(items)) return items;
  return items.map((item) => {
    if (!isTimeSlider(item)) return item;
    const slider = item.control as SliderState;
    if (slider.value < LOCATION_MIN_MINUTES) {
      return { ...item, control: { type: 'slider', value: LOCATION_MIN_MINUTES } };
    }
    return item;
  });
};

export const getSliderEffectiveMin = (item: BuilderItem, items: BuilderItem[]): number => {
  const cfg = item.config as SliderConfig;
  const base = cfg?.min ?? 0;
  if (!isTimeSlider(item)) return base;
  return isLocationActive(items) ? Math.max(base, LOCATION_MIN_MINUTES) : base;
};

// ── Building items ────────────────────────────────────────────────────────────

const buildControl = (m: PublicPackageModifier, initial?: ModifierSelection): ControlState => {
  const selected = initial?.selectedIds.includes(m.id);
  const value = initial?.values[m.id];
  switch (m.type) {
    case 'TOGGLE':
      return { type: 'toggle', altSelected: selected ?? false };
    case 'SLIDER': {
      const cfg = m.config as SliderConfig;
      return { type: 'slider', value: value ?? cfg?.defaultValue ?? 0 };
    }
    case 'INCREMENTER': {
      const cfg = m.config as IncrementerConfig;
      return { type: 'incrementer', count: value ?? cfg?.defaultValue ?? 0 };
    }
    case 'CHECKBOX':
    default:
      return { type: 'checkbox', checked: m.isRequired || (selected ?? m.isIncluded) };
  }
};

/** The builder's rows for a package: its defaults, or the choices in `initial` if given. */
export const createItems = (pkg: PublicPackage, initial?: ModifierSelection): BuilderItem[] => {
  const items = pkg.modifiers.map(
    (m): BuilderItem => ({
      id: m.id,
      name: m.name,
      description: m.description,
      modifierType: m.type,
      isRequired: m.isRequired,
      isIncluded: m.isIncluded,
      priceDeltaCents: m.priceDeltaCents,
      config: m.config,
      control: buildControl(m, initial)
    })
  );
  return initial ? applyConstraints(items) : items;
};

/** Whether these choices differ from where the builder started: by default, the package's defaults. */
export const hasEdits = (
  pkg: PublicPackage,
  selection: ModifierSelection,
  start: ModifierSelection = toSelection(createItems(pkg))
): boolean => {
  const key = ({ selectedIds, values }: ModifierSelection) =>
    JSON.stringify([[...selectedIds].sort(), Object.entries(values).sort()]);
  return key(start) !== key(selection);
};

/** The items after one control changes, with the cross-modifier constraints re-applied. */
export const updateItemControl = (
  items: BuilderItem[],
  id: string,
  next: Partial<ControlState>
): BuilderItem[] =>
  applyConstraints(
    items.map((item) =>
      item.id === id ? { ...item, control: { ...item.control, ...next } as ControlState } : item
    )
  );

// ── /book link ────────────────────────────────────────────────────────────────

/** The query string that opens /book with this package and these choices. */
export const bookingQueryString = (
  pkg: Pick<PublicPackage, 'slug'>,
  { selectedIds, values }: ModifierSelection,
  apply: boolean
): string => {
  const params = new URLSearchParams({ package: pkg.slug });

  if (selectedIds.length > 0) params.set('modifiers', selectedIds.join(','));
  if (Object.keys(values).length > 0) {
    params.set(
      'modifierValues',
      Object.entries(values)
        .map(([id, val]) => `${id}:${val}`)
        .join(',')
    );
  }

  if (apply) params.set('apply', '1');

  return `?${params.toString()}`;
};
