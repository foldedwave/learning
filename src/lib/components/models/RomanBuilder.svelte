<script lang="ts">
	import {
		MAX_ROMAN,
		formatNumber,
		getPlaceValueBreakdown,
		toRoman
	} from '#lib/content/maths/number/roman-numerals/convert.ts';
	import ModelFrame from '../ui/ModelFrame.svelte';

	let { title, prompt, start = 1984 }: { title: string; prompt: string; start?: number } = $props();

	// `start` only seeds the first value; Reset returns to it
	// svelte-ignore state_referenced_locally
	let value = $state<number | null>(start);

	const n = $derived(Math.trunc(value ?? 0));
	const valid = $derived(n > 0 && n <= MAX_ROMAN);
	const parts = $derived(valid ? getPlaceValueBreakdown(n) : []);
	const description = $derived(
		valid
			? `${formatNumber(n)} is ${parts.map((p) => `${formatNumber(p.placeValue)}, ${p.roman}`).join('; ')}. Together: ${toRoman(n)}`
			: 'Type a number from 1 to 3,999,999'
	);
</script>

<ModelFrame {title} {prompt} onreset={() => (value = start)}>
	<label class="input">
		<span>Number</span>
		<input type="number" min="1" max={MAX_ROMAN} bind:value />
	</label>
	{#if valid}
		<ol class="chunks" aria-hidden="true">
			{#each parts as part (part.placeValue)}
				<li>
					<span class="value">{formatNumber(part.placeValue)}</span>
					<span class="roman">{part.roman}</span>
				</li>
			{/each}
		</ol>
		<p class="result" aria-hidden="true">{toRoman(n)}</p>
	{/if}
	<p class="visually-hidden" aria-live="polite">{description}</p>
	{#if !valid}<p class="hint">{description}</p>{/if}
</ModelFrame>

<style>
	.input {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		font-weight: 600;
	}

	input {
		min-height: var(--tap-min);
		width: 12rem;
		border: 2px solid var(--line);
		border-radius: var(--radius-md);
		padding: var(--space-2) var(--space-3);
		font-size: var(--text-xl);
	}

	.chunks {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		list-style: none;
		padding: 0;
		margin: var(--space-4) 0;
	}

	.chunks li {
		display: grid;
		text-align: center;
		border: 2px solid var(--subject, var(--line));
		border-radius: var(--radius-md);
		padding: var(--space-2) var(--space-3);
		min-width: 5rem;
	}

	.value {
		color: var(--ink-soft);
		font-size: var(--text-sm);
	}

	.roman {
		font-size: var(--text-xl);
		font-weight: 600;
	}

	.result {
		font-size: var(--text-2xl);
		font-weight: 600;
		color: var(--subject, var(--ink));
		letter-spacing: 0.05em;
	}

	.hint {
		color: var(--ink-soft);
		margin-top: var(--space-3);
	}
</style>
