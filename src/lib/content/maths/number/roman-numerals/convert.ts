export interface BreakdownPart {
	placeValue: number;
	digit: number;
	roman: string;
}

export const MAX_ROMAN = 3_999_999;

/** U+0304 COMBINING MACRON, used for the vinculum (×1,000) roof bar. */
export const BAR = '̄';

/** Greedy conversion table, largest value first. */
export const ROMAN_MAP = [
	{ val: 1000000, sym: `M${BAR}` },
	{ val: 900000, sym: `CM${BAR}` },
	{ val: 500000, sym: `D${BAR}` },
	{ val: 400000, sym: `CD${BAR}` },
	{ val: 100000, sym: `C${BAR}` },
	{ val: 90000, sym: `XC${BAR}` },
	{ val: 50000, sym: `L${BAR}` },
	{ val: 40000, sym: `XL${BAR}` },
	{ val: 10000, sym: `X${BAR}` },
	{ val: 9000, sym: `IX${BAR}` },
	{ val: 5000, sym: `V${BAR}` },
	{ val: 4000, sym: `IV${BAR}` },
	{ val: 1000, sym: 'M' },
	{ val: 900, sym: 'CM' },
	{ val: 500, sym: 'D' },
	{ val: 400, sym: 'CD' },
	{ val: 100, sym: 'C' },
	{ val: 90, sym: 'XC' },
	{ val: 50, sym: 'L' },
	{ val: 40, sym: 'XL' },
	{ val: 10, sym: 'X' },
	{ val: 9, sym: 'IX' },
	{ val: 5, sym: 'V' },
	{ val: 4, sym: 'IV' },
	{ val: 1, sym: 'I' }
] as const;

export function toRoman(num: number): string {
	if (!Number.isInteger(num) || num <= 0 || num > MAX_ROMAN) return 'Invalid';
	let n = num;
	let result = '';
	for (const { val, sym } of ROMAN_MAP) {
		while (n >= val) {
			result += sym;
			n -= val;
		}
	}
	return result;
}

/** Returns 0 for empty or unparseable input. */
export function fromRoman(str: string): number {
	const s = str.trim().toUpperCase();
	if (!s) return 0;
	let total = 0;
	let i = 0;
	while (i < s.length) {
		const item = ROMAN_MAP.find(({ sym }) => s.startsWith(sym, i));
		if (!item) return 0;
		total += item.val;
		i += item.sym.length;
	}
	return total;
}

/** Splits a number into non-zero place-value chunks, e.g. 49 → 40 (XL) + 9 (IX). */
export function getPlaceValueBreakdown(num: number): BreakdownPart[] {
	const digits = num.toString();
	const parts: BreakdownPart[] = [];
	for (let i = 0; i < digits.length; i++) {
		const digit = Number(digits[i]);
		if (digit === 0) continue;
		const placeValue = digit * 10 ** (digits.length - 1 - i);
		parts.push({ placeValue, digit, roman: toRoman(placeValue) });
	}
	return parts;
}

/** Locale-pinned so server and client always format identically. */
export function formatNumber(n: number): string {
	return n.toLocaleString('en-US');
}
