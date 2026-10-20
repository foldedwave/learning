import { describe, expect, it } from 'vitest';
import { fromRoman, getPlaceValueBreakdown, toRoman } from './convert';

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
