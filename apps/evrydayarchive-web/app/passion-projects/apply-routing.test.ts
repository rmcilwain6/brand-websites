import { describe, expect, it } from 'vitest';

import type { PublicPackage } from '@repo/core';
import { CAMPAIGN } from '@repo/core/campaigns';

import {
  MATCH_REASONS,
  activeSlug,
  applyHref,
  matchedSlug,
  parseAnswers,
  peopleToggleId,
  startingSelection
} from './apply-routing';

const ALL = CAMPAIGN.eligibleSlugs;

describe('matchedSlug', () => {
  it('sends a personal project for one person to Evryday', () => {
    expect(matchedSlug({ type: 'personal', people: 'solo' })).toBe('evryday-package');
  });

  it('sends a personal project with others to Together', () => {
    expect(matchedSlug({ type: 'personal', people: 'group' })).toBe('together');
  });

  it.each(['solo', 'group'] as const)(
    'sends a business to In Practice with people %s',
    (people) => {
      expect(matchedSlug({ type: 'business', people })).toBe('in-practice');
    }
  );

  it('waits until both questions are answered', () => {
    expect(matchedSlug({})).toBeNull();
    expect(matchedSlug({ people: 'solo' })).toBeNull();
    expect(matchedSlug({ type: 'personal' })).toBeNull();
    expect(matchedSlug({ type: 'business' })).toBeNull();
  });
});

describe('activeSlug', () => {
  it('uses the matched package', () => {
    expect(activeSlug({ type: 'business', people: 'solo' }, ALL)).toBe('in-practice');
  });

  it('prefers a package picked directly', () => {
    expect(activeSlug({ type: 'business', people: 'solo', package: 'together' }, ALL)).toBe(
      'together'
    );
  });

  it('shows a picked package without any answers, for shared links', () => {
    expect(activeSlug({ package: 'together' }, ALL)).toBe('together');
  });

  it('ignores a picked package that is not on offer', () => {
    expect(activeSlug({ type: 'business', people: 'solo', package: 'as-it-unfolds' }, ALL)).toBe(
      'in-practice'
    );
    expect(activeSlug({ package: 'as-it-unfolds' }, ALL)).toBeNull();
  });

  it('has nothing to show when the matched package is not on offer', () => {
    expect(activeSlug({ type: 'business', people: 'solo' }, ['together'])).toBeNull();
  });
});

describe('the people toggle', () => {
  const toggle = { id: 'people', name: 'Multiple people', type: 'TOGGLE', isRequired: false };
  const inPractice = {
    slug: 'in-practice',
    modifiers: [
      toggle,
      {
        id: 'images',
        name: 'Number of images',
        type: 'SLIDER',
        isRequired: false,
        config: { defaultValue: 10 }
      }
    ]
  } as unknown as PublicPackage;

  it('is found on In Practice only', () => {
    expect(peopleToggleId(inPractice)).toBe('people');
    expect(peopleToggleId({ ...inPractice, slug: 'together' })).toBeUndefined();
  });

  it('is not found when it has been renamed or removed', () => {
    expect(peopleToggleId({ ...inPractice, modifiers: [] })).toBeUndefined();
  });

  it('starts on for others involved, keeping the other defaults', () => {
    expect(startingSelection(inPractice, 'group')).toEqual({
      selectedIds: ['people'],
      values: { images: 10 }
    });
  });

  it.each(['solo', undefined] as const)('starts off with people %s', (people) => {
    expect(startingSelection(inPractice, people).selectedIds).toEqual([]);
  });
});

describe('MATCH_REASONS', () => {
  it.each(ALL)('has a reason for %s', (slug) => {
    expect(MATCH_REASONS[slug]).toBeTruthy();
  });
});

describe('the URL', () => {
  it('round-trips the answers', () => {
    const answers = { type: 'personal', people: 'group', package: 'in-practice' } as const;
    const url = new URL(applyHref(answers), 'https://example.com');

    expect(parseAnswers(url.searchParams)).toEqual(answers);
  });

  it('has no query when nothing is answered', () => {
    expect(applyHref({})).toBe('/passion-projects');
  });

  it('ignores answers it does not recognise', () => {
    const params = new URLSearchParams('type=corporate&people=many');

    expect(parseAnswers(params)).toEqual({
      type: undefined,
      people: undefined,
      package: undefined
    });
  });
});
