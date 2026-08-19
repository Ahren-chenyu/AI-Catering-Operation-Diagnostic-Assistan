export function parseDurationDays(duration: string): number {
  const dayMatch = duration.match(/(\d+)\s*天/);
  if (dayMatch) {
    return parseInt(dayMatch[1], 10);
  }

  const weekMatch = duration.match(/(\d+)\s*周/);
  if (weekMatch) {
    return parseInt(weekMatch[1], 10) * 7;
  }

  return 7;
}

export function addDays(isoDate: string, days: number): string {
  const date = new Date(isoDate);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function toDateString(iso: string): string {
  return iso.slice(0, 10);
}
