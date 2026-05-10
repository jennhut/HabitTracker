/** Format a Date as YYYY-MM-DD using local time (avoids UTC-shift bugs). */
export function toLocalISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Today's date as YYYY-MM-DD in local time. */
export function todayISO(): string {
  return toLocalISODate(new Date());
}

/** "Monday, 10 May 2026" */
export function formatLongDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

/** "10 May" */
export function formatShortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short',
  });
}

export function addDays(d: Date, n: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
}

/** Monday of the week containing d. */
export function getMonday(d: Date): Date {
  const result = new Date(d);
  result.setDate(result.getDate() - ((result.getDay() + 6) % 7));
  return result;
}

/**
 * Return from/to ISO strings and a 12×7 grid of date strings for a block.
 * offset=0 → current 12-week block ending this Sunday.
 * offset=-1 → previous block, etc.
 */
export function getBlock(offset: number): {
  from: string;
  to: string;
  weeks: string[][];
} {
  const thisMonday = getMonday(new Date());
  // Block start = Monday of (this week − 11 weeks) shifted by offset blocks
  const blockStart = addDays(thisMonday, offset * 84 - 77);

  const weeks: string[][] = [];
  let cursor = new Date(blockStart);
  for (let w = 0; w < 12; w++) {
    const week: string[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(toLocalISODate(cursor));
      cursor = addDays(cursor, 1);
    }
    weeks.push(week);
  }

  return {
    from: toLocalISODate(blockStart),
    to: toLocalISODate(addDays(blockStart, 83)),
    weeks,
  };
}
