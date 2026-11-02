import { describe, expect, it } from 'vitest';

import {
  featureCountLabel,
  nextRailStart,
  prevRailStart,
  railLabel,
  railStartShowing
} from './features';

describe('featureCountLabel', () => {
  it.each([
    [0, 'First features this winter'],
    [1, '1 feature'],
    [9, '9 features']
  ])('labels %i as %s', (count, label) => {
    expect(featureCountLabel(count)).toBe(label);
  });
});

describe('the features row', () => {
  it('slides by four and stops with a full last page', () => {
    expect(nextRailStart(0, 9)).toBe(4);
    expect(nextRailStart(4, 9)).toBe(5);
    expect(nextRailStart(5, 9)).toBe(5);
  });

  it('slides back to the start', () => {
    expect(prevRailStart(5)).toBe(1);
    expect(prevRailStart(1)).toBe(0);
  });

  it('stays put with four or fewer', () => {
    expect(nextRailStart(0, 4)).toBe(0);
    expect(nextRailStart(0, 2)).toBe(0);
  });

  it('labels what is showing', () => {
    expect(railLabel(0, 9)).toBe('1–4 of 9');
    expect(railLabel(5, 9)).toBe('6–9 of 9');
  });

  it('stays put for a card already showing', () => {
    expect(railStartShowing(3, 0, 9)).toBe(0);
    expect(railStartShowing(6, 5, 9)).toBe(5);
  });

  it('moves to show a card that is off the row', () => {
    expect(railStartShowing(4, 0, 9)).toBe(4);
    expect(railStartShowing(8, 0, 9)).toBe(5);
    expect(railStartShowing(0, 5, 9)).toBe(0);
  });
});
