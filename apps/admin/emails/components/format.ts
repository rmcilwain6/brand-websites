// Formatting shared by the email templates. Dates arrive as YYYY-MM-DD strings and are read
// at UTC noon and formatted in UTC, so the day never shifts with the server's time zone.

const atNoonUtc = (ymd: string) => new Date(`${ymd}T12:00:00Z`);

export const formatCurrency = (cents: number) =>
  new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0
  }).format(cents / 100);

/** A modifier's price change: "+$75", "−$15", or "Included". */
export const formatDelta = (cents: number | null): string => {
  if (cents === null || cents === 0) return 'Included';
  if (cents > 0) return `+${formatCurrency(cents)}`;
  return `−${formatCurrency(Math.abs(cents))}`;
};

/** "2026-11-14" → "Saturday, November 14, 2026". Falls back to the raw text if it isn't a date. */
export const formatDateLong = (ymd: string) => {
  const d = atNoonUtc(ymd);
  if (isNaN(d.getTime())) return ymd;
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  });
};

/** "2026-11-14" → "Sat, Nov 14". */
export const formatDateShort = (ymd: string) => {
  const d = atNoonUtc(ymd);
  if (isNaN(d.getTime())) return ymd;
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
  });
};

/** "2027-12-31" → "Dec 31, 2027". */
export const formatExpiry = (ymd: string) => {
  const d = atNoonUtc(ymd);
  if (isNaN(d.getTime())) return ymd;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  });
};

/** "14:30" → "2:30 PM". */
export const formatTime = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  if (h === undefined || m === undefined || isNaN(h) || isNaN(m)) return hhmm;
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};
