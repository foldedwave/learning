import { TIME_ZONE } from './config.ts';

const dayFormat = new Intl.DateTimeFormat('en-CA', {
	timeZone: TIME_ZONE,
	year: 'numeric',
	month: '2-digit',
	day: '2-digit'
});

/** The calendar day (YYYY-MM-DD) in Europe/London for a UTC timestamp. */
export function dayKey(at: string | Date): string {
	return dayFormat.format(typeof at === 'string' ? new Date(at) : at);
}

export function addDays(at: string, days: number): string {
	return new Date(new Date(at).getTime() + days * 86_400_000).toISOString();
}

/** Whole calendar days from `from` to `to`, in Europe/London. */
export function daysBetween(from: string, to: string): number {
	const a = Date.parse(dayKey(from));
	const b = Date.parse(dayKey(to));
	return Math.round((b - a) / 86_400_000);
}
