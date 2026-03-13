import { describe, expect, it } from 'vitest';

import { AdminPackageCreateSchema, AdminPackageUpdateSchema } from './admin-packages';

// ── AdminPackageCreateSchema ──────────────────────────────────────────────────

describe('AdminPackageCreateSchema', () => {
  it('accepts minimal valid payload (slug + name only)', () => {
    expect(
      AdminPackageCreateSchema.safeParse({ slug: 'portrait-session', name: 'Portrait Session' })
        .success
    ).toBe(true);
  });

  it('accepts a fully populated payload', () => {
    expect(
      AdminPackageCreateSchema.safeParse({
        slug: 'signature-session',
        name: 'Signature Session',
        summaryLine: 'Perfect for couples and small families.',
        description: 'Our most popular package for milestone moments.',
        durationMinutes: 120,
        deliverables: ['40 edited photos', 'Online gallery delivery', '2-hour session'],
        notes: 'Travel within 30km of Ottawa included.',
        basePriceCents: 35000,
        sortOrder: 2,
        status: 'ACTIVE'
      }).success
    ).toBe(true);
  });

  it.each(['DRAFT', 'ACTIVE', 'ARCHIVED'])('accepts valid status: %s', (status) => {
    expect(
      AdminPackageCreateSchema.safeParse({ slug: 'my-pkg', name: 'My Pkg', status }).success
    ).toBe(true);
  });

  it('accepts an empty deliverables array', () => {
    expect(
      AdminPackageCreateSchema.safeParse({
        slug: 'portrait-session',
        name: 'Portrait Session',
        deliverables: []
      }).success
    ).toBe(true);
  });

  it('rejects a slug with uppercase letters', () => {
    expect(
      AdminPackageCreateSchema.safeParse({ slug: 'Portrait-Session', name: 'Portrait Session' })
        .success
    ).toBe(false);
  });

  it('rejects a slug with spaces', () => {
    expect(
      AdminPackageCreateSchema.safeParse({ slug: 'portrait session', name: 'Portrait Session' })
        .success
    ).toBe(false);
  });

  it('rejects a slug with special characters', () => {
    expect(
      AdminPackageCreateSchema.safeParse({ slug: 'portrait_session!', name: 'Portrait Session' })
        .success
    ).toBe(false);
  });

  it('rejects a slug shorter than 2 characters', () => {
    expect(
      AdminPackageCreateSchema.safeParse({ slug: 'a', name: 'Portrait Session' }).success
    ).toBe(false);
  });

  it('rejects a name shorter than 2 characters', () => {
    expect(
      AdminPackageCreateSchema.safeParse({ slug: 'portrait-session', name: 'A' }).success
    ).toBe(false);
  });

  it('rejects a negative basePriceCents', () => {
    expect(
      AdminPackageCreateSchema.safeParse({
        slug: 'portrait-session',
        name: 'Portrait Session',
        basePriceCents: -1
      }).success
    ).toBe(false);
  });

  it('rejects a negative sortOrder', () => {
    expect(
      AdminPackageCreateSchema.safeParse({
        slug: 'portrait-session',
        name: 'Portrait Session',
        sortOrder: -1
      }).success
    ).toBe(false);
  });

  it('rejects durationMinutes of zero', () => {
    expect(
      AdminPackageCreateSchema.safeParse({
        slug: 'portrait-session',
        name: 'Portrait Session',
        durationMinutes: 0
      }).success
    ).toBe(false);
  });

  it('rejects a negative durationMinutes', () => {
    expect(
      AdminPackageCreateSchema.safeParse({
        slug: 'portrait-session',
        name: 'Portrait Session',
        durationMinutes: -30
      }).success
    ).toBe(false);
  });

  it('rejects a summaryLine exceeding 200 characters', () => {
    expect(
      AdminPackageCreateSchema.safeParse({
        slug: 'portrait-session',
        name: 'Portrait Session',
        summaryLine: 'x'.repeat(201)
      }).success
    ).toBe(false);
  });

  it('rejects deliverables containing an empty string', () => {
    expect(
      AdminPackageCreateSchema.safeParse({
        slug: 'portrait-session',
        name: 'Portrait Session',
        deliverables: ['40 edited photos', '']
      }).success
    ).toBe(false);
  });

  it('rejects an invalid status value', () => {
    expect(
      AdminPackageCreateSchema.safeParse({
        slug: 'portrait-session',
        name: 'Portrait Session',
        status: 'PUBLISHED'
      }).success
    ).toBe(false);
  });

  it('rejects a missing slug', () => {
    expect(AdminPackageCreateSchema.safeParse({ name: 'Portrait Session' }).success).toBe(false);
  });

  it('rejects a missing name', () => {
    expect(AdminPackageCreateSchema.safeParse({ slug: 'portrait-session' }).success).toBe(false);
  });
});

// ── AdminPackageUpdateSchema ──────────────────────────────────────────────────

describe('AdminPackageUpdateSchema', () => {
  it('accepts a single field update', () => {
    expect(AdminPackageUpdateSchema.safeParse({ name: 'New Name' }).success).toBe(true);
  });

  it.each([
    { summaryLine: 'New tagline' },
    { durationMinutes: 90 },
    { deliverables: ['30 photos'] },
    { sortOrder: 5 },
    { notes: 'Updated note.' }
  ])('accepts updating only: %o', (payload) => {
    expect(AdminPackageUpdateSchema.safeParse(payload).success).toBe(true);
  });

  it('accepts updating multiple fields at once', () => {
    expect(
      AdminPackageUpdateSchema.safeParse({ name: 'Updated', summaryLine: 'New line', sortOrder: 1 })
        .success
    ).toBe(true);
  });

  it('rejects an empty update object', () => {
    expect(AdminPackageUpdateSchema.safeParse({}).success).toBe(false);
  });

  it('enforces field-level validation on partial updates', () => {
    expect(AdminPackageUpdateSchema.safeParse({ basePriceCents: -100 }).success).toBe(false);
    expect(AdminPackageUpdateSchema.safeParse({ slug: 'Bad Slug' }).success).toBe(false);
    expect(AdminPackageUpdateSchema.safeParse({ sortOrder: -1 }).success).toBe(false);
  });
});
