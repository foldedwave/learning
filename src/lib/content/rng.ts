/** A small seeded random number generator. Generators must never use Math.random. */
export interface Rng {
	/** Float in [0, 1). */
	next(): number;
	/** Integer in [min, max], inclusive. */
	int(min: number, max: number): number;
	pick<T>(items: readonly T[]): T;
	shuffle<T>(items: readonly T[]): T[];
	/** True with probability p. */
	chance(p: number): boolean;
}

/** mulberry32: fast, 32-bit state, good enough for question variety. */
export function createRng(seed: number): Rng {
	let a = seed >>> 0;
	const next = () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
	const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1));
	return {
		next,
		int,
		pick: (items) => items[int(0, items.length - 1)],
		shuffle(items) {
			const out = [...items];
			for (let i = out.length - 1; i > 0; i--) {
				const j = int(0, i);
				[out[i], out[j]] = [out[j], out[i]];
			}
			return out;
		},
		chance: (p) => next() < p
	};
}

/** A fresh 31-bit seed for a new question. Seeds are stored, so Math.random is fine here. */
export function newSeed(): number {
	return Math.floor(Math.random() * 0x7fffffff);
}
