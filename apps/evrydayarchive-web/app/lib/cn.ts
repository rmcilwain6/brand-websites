/** Joins class names, filtering falsy values. Lightweight alternative to clsx for this project. */
export const cn = (...classes: (string | undefined | false | null)[]): string =>
  classes.filter(Boolean).join(' ');
