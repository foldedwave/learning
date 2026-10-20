import { describe, expect, it } from 'vitest';
import {
	additiveValue,
	fromRoman,
	getPlaceValueBreakdown,
	hasSubtractivePair,
	lenientValue,
	normaliseRoman,
	toAcrossPlacesRoman,
	toAdditiveRoman,
	toReversedRoman,
	toRoman
} from './convert';

describe('toRoman', () => {
	it.each([
		[1, 'I'],
		[4, 'IV'],
		[49, 'XLIX'],
		[99, 'XCIX'],
		[444, 'CDXLIV'],
		[1984, 'MCMLXXXIV'],
		[3999, 'MMMCMXCIX'],
		[4000, 'IV̄'],
		[1_000_000, 'M̄']
	])('%i → %s', (n, roman) => {
		expect(toRoman(n)).toBe(roman);
	});

	it('rejects out-of-range values', () => {
		expect(toRoman(0)).toBe('Invalid');
		expect(toRoman(4_000_000)).toBe('Invalid');
	});
});

describe('fromRoman', () => {
	it('round-trips every supported value in a sample', () => {
		for (const n of [1, 9, 14, 40, 90, 400, 999, 3999, 4000, 75_000, 1_500_000, 3_999_999]) {
			expect(fromRoman(toRoman(n))).toBe(n);
		}
	});

	it('returns 0 for invalid input', () => {
		expect(fromRoman('')).toBe(0);
		expect(fromRoman('ABC')).toBe(0);
	});
});

describe('getPlaceValueBreakdown', () => {
	it('chunks by place value and skips zeros', () => {
		expect(getPlaceValueBreakdown(1904).map((p) => p.roman)).toEqual(['M', 'CM', 'IV']);
	});
});

describe('misconception helpers', () => {
	it('reads numerals additively and leniently', () => {
		expect(additiveValue('IV')).toBe(6);
		expect(additiveValue('XLIX')).toBe(71);
		expect(lenientValue('IL')).toBe(49);
		expect(lenientValue('XLIX')).toBe(49);
		expect(lenientValue('V̄')).toBe(5000);
		expect(lenientValue('ABC')).toBeNull();
	});

	it('normalises typed answers', () => {
		expect(normaliseRoman(' xl ix ')).toBe('XLIX');
	});

	it('detects subtractive pairs', () => {
		expect(hasSubtractivePair('XIV')).toBe(true);
		expect(hasSubtractivePair('XVI')).toBe(false);
	});

	it.each([
		[4, 'IIII'],
		[49, 'XXXXVIIII'],
		[1999, 'MDCCCCLXXXXVIIII']
	])('additive form of %i is %s', (n, roman) => {
		expect(toAdditiveRoman(n)).toBe(roman);
		expect(additiveValue(roman)).toBe(n);
	});

	it.each([
		[4, 'VI'],
		[49, 'LXXI'],
		[944, 'MCLXVI']
	])('reversed form of %i is %s', (n, roman) => {
		expect(toReversedRoman(n)).toBe(roman);
	});

	it.each([
		[49, 'IL'],
		[99, 'IC'],
		[45, 'VL'],
		[1999, 'MIM'],
		[1949, 'MCMIL'],
		[490, 'XD'],
		[4, null],
		[40, null],
		[12, null]
	])('across-places form of %i is %s', (n, roman) => {
		expect(toAcrossPlacesRoman(n)).toBe(roman);
		if (roman) expect(lenientValue(roman)).toBe(n);
	});
});
