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

const SYMBOL_VALUES: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };

/** Uppercases, removes spaces and commas, and turns a typed `_X` or `X_` style bar into a vinculum. */
export function normaliseRoman(input: string): string {
	return input.toUpperCase().replace(/[\s,]/g, '').replace(/̅/g, BAR);
}

/** Splits a numeral into symbol values (a barred symbol is ×1,000). Null if any character is not a numeral. */
export function symbolValues(roman: string): number[] | null {
	const s = normaliseRoman(roman);
	const out: number[] = [];
	for (let i = 0; i < s.length; i++) {
		const base = SYMBOL_VALUES[s[i]];
		if (base === undefined) return null;
		if (s[i + 1] === BAR) {
			out.push(base * 1000);
			i++;
		} else {
			out.push(base);
		}
	}
	return out;
}

/** Reads every symbol as adding, ignoring the subtraction rule (IV → 6). */
export function additiveValue(roman: string): number | null {
	const values = symbolValues(roman);
	return values && values.length ? values.reduce((a, b) => a + b, 0) : null;
}

/** Reads any smaller-before-larger pair as subtraction, even ones the standard rules forbid (IL → 49). */
export function lenientValue(roman: string): number | null {
	const values = symbolValues(roman);
	if (!values || !values.length) return null;
	return values.reduce((total, v, i) => total + (v < (values[i + 1] ?? 0) ? -v : v), 0);
}

/** True if the numeral uses any subtractive pair, e.g. the IV in XIV. */
export function hasSubtractivePair(roman: string): boolean {
	const values = symbolValues(roman);
	return !!values && values.some((v, i) => v < (values[i + 1] ?? 0));
}

/** The numeral with every symbol only added, e.g. 49 → XXXXVIIII. Up to 3,999 only. */
export function toAdditiveRoman(num: number): string {
	const places: [string, string][] = [
		['M', ''],
		['C', 'D'],
		['X', 'L'],
		['I', 'V']
	];
	const digits = String(num).padStart(4, '0').split('').map(Number);
	return digits
		.map((d, i) => {
			const [one, five] = places[i];
			if (!five) return one.repeat(d);
			return d >= 5 ? five + one.repeat(d - 5) : one.repeat(d);
		})
		.join('');
}

const SUBTRACTIVE_SWAPS: [string, string][] = [
	['CM', 'MC'],
	['CD', 'DC'],
	['XC', 'CX'],
	['XL', 'LX'],
	['IX', 'XI'],
	['IV', 'VI']
];

/** The canonical numeral with each subtractive pair written the wrong way round (49 → LXXI). */
export function toReversedRoman(num: number): string {
	return getPlaceValueBreakdown(num)
		.map(({ roman }) => SUBTRACTIVE_SWAPS.find(([pair]) => pair === roman)?.[1] ?? roman)
		.join('');
}

/**
 * The "one subtraction across place values" mistake, e.g. 49 → IL, 1999 → MIM.
 * Returns null when the number has no such shortcut.
 */
export function toAcrossPlacesRoman(num: number): string | null {
	const units: [number, string][] = [
		[1, 'I'],
		[5, 'V'],
		[10, 'X'],
		[50, 'L'],
		[100, 'C'],
		[500, 'D']
	];
	const bigs: [number, string][] = [
		[10, 'X'],
		[50, 'L'],
		[100, 'C'],
		[500, 'D'],
		[1000, 'M']
	];
	const shortcut = (r: number): string | null => {
		for (const [big, bigSym] of bigs) {
			for (const [unit, unitSym] of units) {
				if (unit < big && big - unit === r) {
					const pair = unitSym + bigSym;
					// Only a mistake if it differs from the standard form
					return pair !== toRoman(r) ? pair : null;
				}
			}
		}
		return null;
	};
	for (const mod of [1000, 100]) {
		const head = num - (num % mod);
		const tail = shortcut(num % mod);
		if (tail) return (head ? toRoman(head) : '') + tail;
	}
	return null;
}
