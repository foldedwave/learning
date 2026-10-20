<script lang="ts">
	import { BAR } from '#lib/content/maths/number/roman-numerals/convert.ts';

	let {
		vinculum,
		disabled,
		onkey
	}: { vinculum: boolean; disabled: boolean; onkey: (key: string) => void } = $props();

	const letters = ['I', 'V', 'X', 'L', 'C', 'D', 'M'];
	const barred = ['V', 'X', 'L', 'C', 'D', 'M'].map((l) => l + BAR);
</script>

<div class="keypad" role="group" aria-label="Roman numeral keys">
	{#if vinculum}
		<div class="row">
			{#each barred as key (key)}
				<button
					type="button"
					{disabled}
					onclick={() => onkey(key)}
					aria-label="{key[0]} with roof bar">{key}</button
				>
			{/each}
		</div>
	{/if}
	<div class="row">
		{#each letters as key (key)}
			<button type="button" {disabled} onclick={() => onkey(key)}>{key}</button>
		{/each}
		<button type="button" {disabled} onclick={() => onkey('⌫')} aria-label="Delete">⌫</button>
	</div>
</div>

<style>
	.keypad {
		display: grid;
		gap: var(--space-2);
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	button {
		min-width: var(--tap-min);
		min-height: var(--tap-min);
		border-radius: var(--radius-sm);
		border: 2px solid var(--line);
		background: var(--surface);
		font-size: var(--text-lg);
		font-weight: 600;
		cursor: pointer;
	}
</style>
