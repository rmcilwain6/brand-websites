/**
 * How the landing page's two questions pick a package. The answers live in the URL, so refresh,
 * back and shared links all land in the same place.
 */

import type { PublicPackage } from '@repo/core';
// Subpath import keeps the core package's Zod schemas out of the client bundle.
import type { ModifierSelection } from '@repo/core/pricing';

import { createItems, toSelection } from '../package-builder/builder-state';

export type ProjectType = 'personal' | 'business';
export type People = 'solo' | 'group';

export type ApplyAnswers = {
  type?: ProjectType;
  people?: People;
  /** A package picked directly with the tabs, over the one the answers matched. */
  package?: string;
};

/** Which package the answers point to, or null until both questions are answered. */
export const matchedSlug = ({ type, people }: ApplyAnswers): string | null => {
  if (!type || !people) return null;
  if (type === 'business') return 'in-practice';
  return people === 'group' ? 'together' : 'evryday-package';
};

/** The package to show: one picked directly, if it's on offer, otherwise the matched one. */
export const activeSlug = (answers: ApplyAnswers, available: readonly string[]): string | null => {
  if (answers.package && available.includes(answers.package)) return answers.package;
  const matched = matchedSlug(answers);
  return matched && available.includes(matched) ? matched : null;
};

/** Why the answers led to this package. Only for the matched one: a picked one has its own reason. */
export const MATCH_REASONS: Record<string, string> = {
  'evryday-package':
    'A personal project, just you. Evryday is the package built for one person, and the one most people start with.',
  together:
    'A personal project with other people in it. Together gives the session room for everyone involved.',
  'in-practice':
    'A business. In Practice includes an alignment call, because commercial work takes more effort to fit a professional brand.'
};

/** The name of In Practice's toggle in admin. Renaming it there stops the answers setting it. */
const PEOPLE_TOGGLE_NAME = 'Multiple people';

/** The toggle that "Others too" sets, for the packages that have one. */
export const peopleToggleId = (pkg: PublicPackage): string | undefined =>
  pkg.slug === 'in-practice'
    ? pkg.modifiers.find((m) => m.type === 'TOGGLE' && m.name === PEOPLE_TOGGLE_NAME)?.id
    : undefined;

/** A package's defaults, with the people toggle on for "Others too". It can still be changed. */
export const startingSelection = (pkg: PublicPackage, people?: People): ModifierSelection => {
  const defaults = toSelection(createItems(pkg));
  const toggleId = peopleToggleId(pkg);
  return toggleId && people === 'group'
    ? { ...defaults, selectedIds: [...defaults.selectedIds, toggleId] }
    : defaults;
};

export const parseAnswers = (params: { get: (key: string) => string | null }): ApplyAnswers => {
  const type = params.get('type');
  const people = params.get('people');
  return {
    type: type === 'personal' || type === 'business' ? type : undefined,
    people: people === 'solo' || people === 'group' ? people : undefined,
    package: params.get('package') ?? undefined
  };
};

/** The page's URL for these answers. */
export const applyHref = ({ type, people, package: pkg }: ApplyAnswers): string => {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  if (people) params.set('people', people);
  if (pkg) params.set('package', pkg);
  const query = params.toString();
  return query ? `/passion-projects?${query}` : '/passion-projects';
};
