import { BookingFormSchema, jsonError, jsonOk, parseJson } from '@repo/core';
import { prisma } from '@repo/db';

import { sendBookingConfirmation, sendBookingNotification } from '../../../lib/email';
import type { ModifierLineItem } from '../../../lib/email';

// TODO: Rate limiting — add per-IP limits when infrastructure supports it.

// ── Modifier config shapes (mirrors core schemas) ─────────────────────────────

type SliderCfg = { defaultValue: number; step: number; pricePerStep: number; unit: string };
type IncrementerCfg = { defaultValue: number; pricePerUnit: number; unit?: string };
type ToggleCfg = { defaultLabel: string; altLabel: string };

type DbModifier = {
  id: string;
  name: string;
  type: string;
  isRequired: boolean;
  priceDeltaCents: number | null;
  config: unknown;
};

const buildModifierLineItems = (
  modifiers: DbModifier[],
  selectedIds: string[],
  values: Record<string, number>
): ModifierLineItem[] => {
  const items: ModifierLineItem[] = [];

  for (const m of modifiers) {
    const selected = m.isRequired || selectedIds.includes(m.id);
    if (!selected) continue;

    const cfg = m.config as Record<string, unknown> | null;

    if (m.type === 'SLIDER') {
      const c = cfg as SliderCfg | null;
      if (!c) continue;
      const value = values[m.id] ?? c.defaultValue;
      const steps = Math.round((value - c.defaultValue) / c.step);
      const delta = steps * c.pricePerStep;
      items.push({
        name: m.name,
        displayValue: `${value}${c.unit}`,
        priceDeltaCents: delta || null
      });
    } else if (m.type === 'INCREMENTER') {
      const c = cfg as IncrementerCfg | null;
      if (!c) continue;
      const count = values[m.id] ?? c.defaultValue;
      const delta = (count - c.defaultValue) * c.pricePerUnit;
      items.push({
        name: m.name,
        displayValue: `${count}${c.unit ? ` ${c.unit}` : ''}`,
        priceDeltaCents: delta || null
      });
    } else if (m.type === 'TOGGLE') {
      const c = cfg as ToggleCfg | null;
      const altActive = selectedIds.includes(m.id);
      items.push({
        name: m.name,
        displayValue: c ? (altActive ? c.altLabel : c.defaultLabel) : undefined,
        priceDeltaCents: altActive ? (m.priceDeltaCents ?? null) : null
      });
    } else {
      // CHECKBOX
      items.push({ name: m.name, priceDeltaCents: m.priceDeltaCents ?? null });
    }
  }

  return items;
};

export const POST = async (req: Request): Promise<Response> => {
  const result = await parseJson(req, BookingFormSchema);

  if (!result.ok) {
    return jsonError(result.error);
  }

  const {
    name,
    email,
    phone,
    location,
    preferredDate,
    preferredTime,
    notes,
    packageId,
    packageName,
    modifierIds,
    modifierValues,
    springSale,
    estimatedTotalCents
  } = result.data;

  // Combine date + optional time into a DateTime for BookingRequest.requestedAt.
  // Time defaults to midnight if not provided; stored as UTC.
  const timePart = preferredTime ?? '00:00';
  const requestedAt = new Date(`${preferredDate}T${timePart}:00`);

  let inquiry;
  try {
    inquiry = await prisma.inquiry.create({
      data: {
        type: 'BOOKING_REQUEST',
        name,
        email,
        phone: phone ?? null,
        message: notes ?? null,
        payload: {
          location,
          packageName: packageName ?? null,
          modifierIds,
          modifierValues: modifierValues ?? null,
          estimatedTotalCents: estimatedTotalCents ?? null,
          preferredDate,
          preferredTime: preferredTime ?? null
        },
        bookingRequest: {
          create: {
            packageId: packageId ?? null,
            requestedAt: isNaN(requestedAt.getTime()) ? null : requestedAt,
            notes: notes ?? null,
            selectedOptions: { modifierIds, modifierValues: modifierValues ?? {} }
          }
        }
      },
      include: { bookingRequest: true }
    });
  } catch (error) {
    console.error('[bookings] Failed to persist booking request', error);
    return jsonError({ code: 'INTERNAL', message: 'Failed to save booking request.' });
  }

  // ── Build modifier line items for the email receipt ───────────────────────
  let modifierLineItems: ModifierLineItem[] | undefined;

  if (packageId) {
    const pkgRecord = await prisma.package
      .findUnique({
        where: { id: packageId },
        select: {
          basePriceCents: true,
          modifiers: {
            select: {
              id: true,
              name: true,
              type: true,
              isRequired: true,
              priceDeltaCents: true,
              config: true
            },
            orderBy: { sortOrder: 'asc' }
          }
        }
      })
      .catch(() => null);

    if (pkgRecord) {
      modifierLineItems = buildModifierLineItems(
        pkgRecord.modifiers,
        modifierIds ?? [],
        modifierValues ?? {}
      );

      if (springSale && estimatedTotalCents != null) {
        const preSaleTotal =
          (pkgRecord.basePriceCents ?? 0) +
          modifierLineItems.reduce((sum, item) => sum + (item.priceDeltaCents ?? 0), 0);
        const discountCents = preSaleTotal - estimatedTotalCents;
        if (discountCents > 0) {
          modifierLineItems.push({
            name: 'Spring Sale (10% off)',
            priceDeltaCents: -discountCents
          });
        }
      }
    }
  }

  // ── Emails ────────────────────────────────────────────────────────────────
  const emailData = {
    name,
    email,
    phone: phone ?? undefined,
    location,
    preferredDate,
    preferredTime: preferredTime ?? undefined,
    packageName: packageName ?? undefined,
    estimatedTotalCents: estimatedTotalCents ?? undefined,
    notes: notes ?? undefined,
    inquiryId: inquiry.id,
    modifierLineItems
  };

  Promise.all([sendBookingConfirmation(emailData), sendBookingNotification(emailData)]).catch(
    (err) => {
      console.error('[bookings] Email send failed', { inquiryId: inquiry.id, err });
    }
  );

  return jsonOk({ inquiryId: inquiry.id });
};
