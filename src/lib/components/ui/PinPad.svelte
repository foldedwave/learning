<script lang="ts">
	/**
	 * A picture PIN (three taps from nine pictures) for children, or a digit PIN for the parent.
	 * The value is written to a hidden input named `name`, so it submits with the surrounding form.
	 */
	let {
		kind,
		pictures = [],
		name = 'pin',
		onfull
	}: {
		kind: 'picture' | 'digit';
		pictures?: readonly string[];
		name?: string;
		onfull?: (value: string) => void;
	} = $props();

	let entered = $state<string[]>([]);
	const keys = $derived(
		kind === 'picture'
			? pictures.map((p, i) => ({ value: String(i), label: p }))
			: '1234567890'.split('').map((d) => ({ value: d, label: d }))
	);
	const max = $derived(kind === 'picture' ? 3 : 6);
	const value = $derived(entered.join(kind === 'picture' ? '-' : ''));

	function press(key: string) {
		if (entered.length >= max) return;
		entered.push(key);
		if (kind === 'picture' && entered.length === max) onfull?.(value);
	}
</script>

<div class="pinpad">
	<input type="hidden" {name} {value} />
	<div
		class="dots"
		aria-live="polite"
		aria-label="{entered.length} of {kind === 'picture' ? 3 : '4 to 6'} entered"
	>
		{#each { length: kind === 'picture' ? 3 : Math.max(4, entered.length) }, i (i)}
			<span class="dot" class:filled={i < entered.length}>
				{#if kind === 'picture' && entered[i] !== undefined}{pictures[Number(entered[i])]}{/if}
			</span>
		{/each}
	</div>
	<div class="keys" class:pictures={kind === 'picture'}>
		{#each keys as key (key.value)}
			<button
				type="button"
				class="key"
				onclick={() => press(key.value)}
				aria-label={kind === 'picture'
					? `Picture ${Number(key.value) + 1}: ${key.label}`
					: key.label}
			>
				{key.label}
			</button>
		{/each}
		<button type="button" class="key clear" onclick={() => entered.pop()} aria-label="Delete"
			>⌫</button
		>
	</div>
</div>

<style>
	.pinpad {
		display: grid;
		gap: var(--space-4);
		justify-items: center;
	}

	.dots {
		display: flex;
		gap: var(--space-3);
		min-height: var(--tap-min);
	}

	.dot {
		width: var(--tap-min);
		height: var(--tap-min);
		border-radius: 50%;
		border: 2px solid var(--line);
		display: grid;
		place-items: center;
		font-size: var(--text-xl);
	}

	.dot.filled {
		background: var(--surface-soft);
		border-color: var(--ink-soft);
	}

	.keys {
		display: grid;
		grid-template-columns: repeat(3, calc(var(--tap-min) * 1.5));
		gap: var(--space-3);
	}

	.key {
		min-height: calc(var(--tap-min) * 1.4);
		border-radius: var(--radius-md);
		border: 2px solid var(--line);
		background: var(--surface);
		font-size: var(--text-xl);
		cursor: pointer;
	}

	.pictures .key {
		font-size: var(--text-2xl);
	}

	.clear {
		grid-column: 3;
	}
</style>
