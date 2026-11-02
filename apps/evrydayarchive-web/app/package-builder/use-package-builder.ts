'use client';

import { useCallback, useMemo, useState } from 'react';

import type { PublicPackage } from '@repo/core';
import type { ModifierSelection } from '@repo/core/pricing';

import { toBookingSelection } from '../book/booking-selection';
import {
  createItems,
  priceLines,
  toSelection,
  updateItemControl,
  type ControlState
} from './builder-state';

/**
 * The state behind the package builder, for any page that shows one.
 *
 * `pkg` and `initial` only seed the state. To switch package afterwards call `reset`, which goes
 * to the new package's defaults or the complete choices given, or remount with a new `key`.
 */
export const usePackageBuilder = (initialPkg: PublicPackage, initial?: ModifierSelection) => {
  const [state, setState] = useState(() => ({
    pkg: initialPkg,
    items: createItems(initialPkg, initial)
  }));
  const { pkg, items } = state;

  const updateControl = useCallback((id: string, next: Partial<ControlState>) => {
    setState((prev) => ({ ...prev, items: updateItemControl(prev.items, id, next) }));
  }, []);

  const reset = useCallback((nextPkg: PublicPackage, choices?: ModifierSelection) => {
    setState({ pkg: nextPkg, items: createItems(nextPkg, choices) });
  }, []);

  const modifierSelection = useMemo(() => toSelection(items), [items]);

  /** In the shape the booking form takes. */
  const selection = useMemo(
    () => toBookingSelection(pkg, modifierSelection),
    [pkg, modifierSelection]
  );

  const lines = useMemo(() => priceLines(items), [items]);

  return {
    pkg,
    items,
    modifierSelection,
    selection,
    breakdown: {
      baseCents: pkg.basePriceCents,
      lines,
      // toBookingSelection always estimates a total; the type allows none for a /book with no package.
      totalCents: selection.estimatedTotalCents ?? 0
    },
    updateControl,
    reset
  };
};
