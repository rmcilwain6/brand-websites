import { describe, expect, it } from 'vitest';

import type { PublicPackage, PublicPackageModifier } from '@repo/core';

import { toBookingSelection } from '../book/booking-selection';
import {
  bookingQueryString,
  createItems,
  getSliderEffectiveMin,
  priceLines,
  toSelection,
  updateItemControl
} from './builder-state';

const modifier = (
  overrides: Partial<PublicPackageModifier> & Pick<PublicPackageModifier, 'id' | 'name' | 'type'>
) =>
  ({
    description: null,
    isRequired: false,
    isIncluded: false,
    priceDeltaCents: null,
    config: null,
    ...overrides
  }) as PublicPackageModifier;

// Shaped like the packages in the admin: a required item, a slider, a location add-on and a toggle.
const pkg = {
  id: 'pkg_1',
  slug: 'evryday-package',
  name: 'Evryday',
  description: null,
  basePriceCents: 15000,
  modifiers: [
    modifier({ id: 'edits', name: 'Edited photos', type: 'CHECKBOX', isRequired: true }),
    modifier({
      id: 'length',
      name: 'Session length',
      type: 'SLIDER',
      config: { min: 30, max: 120, step: 15, defaultValue: 60, unit: 'min', pricePerStep: 2500 }
    } as never),
    modifier({
      id: 'images',
      name: 'Number of images',
      type: 'INCREMENTER',
      config: { min: 1, max: 20, defaultValue: 5, unit: 'photos', pricePerUnit: 1000 }
    } as never),
    modifier({
      id: 'location',
      name: 'Additional location',
      type: 'CHECKBOX',
      priceDeltaCents: 3000
    }),
    modifier({
      id: 'editing',
      name: 'Processing effort',
      type: 'TOGGLE',
      priceDeltaCents: -1500,
      config: { defaultLabel: 'Regular', altLabel: 'Light' }
    } as never)
  ]
} as unknown as PublicPackage;

const on = (items: ReturnType<typeof createItems>, id: string, next: object) =>
  updateItemControl(items, id, next);

describe('createItems', () => {
  it('starts from the package defaults', () => {
    const items = createItems(pkg);

    expect(toSelection(items)).toEqual({ selectedIds: [], values: { length: 60, images: 5 } });
    expect(priceLines(items)).toEqual([]);
  });

  it('checks a modifier the package includes, which then counts as selected', () => {
    const included = {
      ...pkg,
      modifiers: [modifier({ id: 'album', name: 'Album', type: 'CHECKBOX', isIncluded: true })]
    };

    expect(toSelection(createItems(included)).selectedIds).toEqual(['album']);
  });

  it('restores earlier choices', () => {
    const items = createItems(pkg, {
      selectedIds: ['editing'],
      values: { length: 90, images: 8 }
    });

    expect(toSelection(items)).toEqual({
      selectedIds: ['editing'],
      values: { length: 90, images: 8 }
    });
  });

  it('applies the location minimum to restored choices', () => {
    const items = createItems(pkg, { selectedIds: ['location'], values: { length: 60 } });

    expect(toSelection(items).values.length).toBe(90);
  });

  it('never unchecks a required modifier when restoring', () => {
    const [required] = createItems(pkg, { selectedIds: [], values: {} });

    expect(required?.control).toEqual({ type: 'checkbox', checked: true });
  });
});

describe('the location add-on', () => {
  it('raises a shorter session to 90 minutes and raises the slider minimum', () => {
    const before = createItems(pkg);
    const after = on(before, 'location', { type: 'checkbox', checked: true });
    const slider = after.find((i) => i.id === 'length')!;

    expect(slider.control).toEqual({ type: 'slider', value: 90 });
    expect(getSliderEffectiveMin(slider, after)).toBe(90);
  });

  it('leaves the session length alone, and the minimum back at base, when taken off', () => {
    const added = on(createItems(pkg), 'location', { type: 'checkbox', checked: true });
    const removed = on(added, 'location', { type: 'checkbox', checked: false });
    const slider = removed.find((i) => i.id === 'length')!;

    expect(slider.control).toEqual({ type: 'slider', value: 90 });
    expect(getSliderEffectiveMin(slider, removed)).toBe(30);
  });
});

describe('pricing parity with /book', () => {
  // Each case is a builder state and the total it has always shown.
  const cases: [string, (i: ReturnType<typeof createItems>) => typeof i, number][] = [
    ['the defaults', (i) => i, 15000],
    ['a longer session', (i) => on(i, 'length', { type: 'slider', value: 90 }), 20000],
    ['a shorter session', (i) => on(i, 'length', { type: 'slider', value: 30 }), 10000],
    ['fewer images', (i) => on(i, 'images', { type: 'incrementer', count: 3 }), 13000],
    ['the cheaper toggle', (i) => on(i, 'editing', { type: 'toggle', altSelected: true }), 13500],
    // The add-on's $30 plus 60 → 90 minutes at $25 per 15.
    ['a location', (i) => on(i, 'location', { type: 'checkbox', checked: true }), 23000]
  ];

  it.each(cases)('prices %s the same in both places', (_name, change, expected) => {
    const items = change(createItems(pkg));
    const fromBuilder = toBookingSelection(pkg, toSelection(items));

    // Round trip through the link, the way /book reads it.
    const params = new URLSearchParams(bookingQueryString(pkg, toSelection(items), false));
    const values = Object.fromEntries(
      (params.get('modifierValues') ?? '').split(',').map((pair) => {
        const [id, value] = pair.split(':');
        return [id, Number(value)];
      })
    );
    const fromLink = toBookingSelection(pkg, {
      selectedIds: (params.get('modifiers') ?? '').split(',').filter(Boolean),
      values
    });

    expect(fromBuilder.estimatedTotalCents).toBe(expected);
    expect(fromLink.estimatedTotalCents).toBe(expected);
    expect(fromLink.modifiers.map((m) => m.id)).toEqual(fromBuilder.modifiers.map((m) => m.id));
  });

  it('adds up to the base price plus the summary lines', () => {
    let items = createItems(pkg);
    items = on(items, 'location', { type: 'checkbox', checked: true });
    items = on(items, 'editing', { type: 'toggle', altSelected: true });

    const lines = priceLines(items);
    const total = toBookingSelection(pkg, toSelection(items)).estimatedTotalCents;

    expect(lines.map((l) => l.name)).toEqual([
      'Session length',
      'Additional location',
      'Processing effort'
    ]);
    expect(15000 + lines.reduce((sum, l) => sum + l.deltaCents, 0)).toBe(total);
  });
});

describe('bookingQueryString', () => {
  it('keeps the existing link format', () => {
    expect(
      bookingQueryString(pkg, { selectedIds: ['a', 'b'], values: { x: 3, y: 90 } }, false)
    ).toBe('?package=evryday-package&modifiers=a%2Cb&modifierValues=x%3A3%2Cy%3A90');
  });

  it('leaves out empty choices and carries apply', () => {
    expect(bookingQueryString(pkg, { selectedIds: [], values: {} }, true)).toBe(
      '?package=evryday-package&apply=1'
    );
  });
});
