import { describe, expect, it } from 'vitest';

import { CAMPAIGN } from '@repo/core/campaigns';

import { MATCH_REASONS, activeSlug, applyHref, matchedSlug, parseAnswers } from './apply-routing';

const ALL = CAMPAIGN.eligibleSlugs;

describe('matchedSlug', () => {
  it('sends a personal project for one person to Evryday', () => {
    expect(matchedSlug({ type: 'personal', people: 'solo' })).toBe('evryday-package');
  });

  it('sends a personal project with others to Together', () => {
    expect(matchedSlug({ type: 'personal', people: 'group' })).toBe('together');
  });

  it.each([undefined, 'solo', 'group'] as const)(
    'sends a business to In Practice with people %s',
    (people) => {
      expect(matchedSlug({ type: 'business', people })).toBe('in-practice');
    }
  );

  it('waits until there is enough to go on', () => {
    expect(matchedSlug({})).toBeNull();
    expect(matchedSlug({ people: 'solo' })).toBeNull();
    expect(matchedSlug({ type: 'personal' })).toBeNull();
  });
});

describe('activeSlug', () => {
  it('uses the matched package', () => {
    expect(activeSlug({ type: 'business' }, ALL)).toBe('in-practice');
  });

  it('prefers a package picked directly', () => {
    expect(activeSlug({ type: 'business', package: 'together' }, ALL)).toBe('together');
  });

  it('shows a picked package without any answers, for shared links', () => {
    expect(activeSlug({ package: 'together' }, ALL)).toBe('together');
  });

  it('ignores a picked package that is not on offer', () => {
    expect(activeSlug({ type: 'business', package: 'as-it-unfolds' }, ALL)).toBe('in-practice');
    expect(activeSlug({ package: 'as-it-unfolds' }, ALL)).toBeNull();
  });

  it('has nothing to show when the matched package is not on offer', () => {
    expect(activeSlug({ type: 'business' }, ['together'])).toBeNull();
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
