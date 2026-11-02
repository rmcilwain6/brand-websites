import { describe, expect, it } from 'vitest';

import { WALL } from './wall';

const COLUMNS = 6;

/** Places spans the way CSS grid's default auto-placement does, returning each row's filled cells. */
const placeInOrder = (spans: [columns: number, rows: number][]): boolean[][] => {
  const rows: boolean[][] = [];
  const free = (row: number, column: number) => !rows[row]?.[column];
  let row = 0;
  let column = 0;

  for (const [width, height] of spans) {
    const fits = () => {
      if (column + width > COLUMNS) return false;
      for (let r = row; r < row + height; r++) {
        for (let c = column; c < column + width; c++) {
          if (!free(r, c)) return false;
        }
      }
      return true;
    };
    while (!fits()) {
      column++;
      if (column + width > COLUMNS) {
        column = 0;
        row++;
      }
    }
    for (let r = row; r < row + height; r++) {
      rows[r] ??= Array<boolean>(COLUMNS).fill(false);
      for (let c = column; c < column + width; c++) rows[r]![c] = true;
    }
    column += width;
  }
  return rows;
};

describe('the phone wall', () => {
  const shown = WALL.filter((slot) => slot.phone);

  it('counts up from 01 with nothing skipped', () => {
    expect(shown.map((slot) => slot.number)).toEqual(
      shown.map((_, index) => String(index + 1).padStart(2, '0'))
    );
  });

  it('fills the full width on every row, with no holes', () => {
    const rows = placeInOrder(shown.map((slot) => slot.phone!));
    expect(rows.every((cells) => cells.every(Boolean))).toBe(true);
  });
});
