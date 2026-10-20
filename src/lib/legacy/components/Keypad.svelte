<script lang="ts">
	import { BAR } from '#lib/content/maths/number/roman-numerals/convert.ts';

	let {
		input,
		showVinculum,
		showDigits,
		disabled,
		onpress,
		onbackspace,
		onsubmit
	}: {
		input: string;
		showVinculum: boolean;
		showDigits: boolean;
		disabled: boolean;
		onpress: (value: string) => void;
		onbackspace: () => void;
		onsubmit: () => void;
	} = $props();

	const romans = ['I', 'V', 'X', 'L', 'C', 'D', 'M'];
	const barred = ['V', 'X', 'L', 'C', 'D', 'M'].map((l) => l + BAR);
	const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
</script>

<div class="keypad">
	<div class="display-box">
		<div class="display" aria-live="polite">{input || '_'}</div>
		<button type="button" class="del" {disabled} onclick={onbackspace}>⌫ Delete</button>
	</div>

	<div class="rows">
		{#if showVinculum}
			<div class="row">
				{#each barred as key (key)}
					<button type="button" class="key vinculum" {disabled} onclick={() => onpress(key)}>
						{key}
					</button>
				{/each}
			</div>
		{/if}
		<div class="row">
			{#each romans as key (key)}
				<button type="button" class="key" {disabled} onclick={() => onpress(key)}>{key}</button>
			{/each}
		</div>
		{#if showDigits}
			<div class="row">
				{#each digits as key (key)}
					<button type="button" class="key" {disabled} onclick={() => onpress(key)}>{key}</button>
				{/each}
			</div>
		{/if}
	</div>

	<button type="button" class="submit" {disabled} onclick={onsubmit}>Check My Answer ⚔️</button>
</div>

<style>
	.keypad {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.display-box {
		display: flex;
		align-items: center;
		border: 2px solid var(--stone-border);
		border-radius: 14px;
		background: white;
		padding: 8px 16px;
		min-height: 64px;
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.04);
	}

	.display {
		flex: 1;
		font-size: 1.9rem;
		font-weight: 800;
		letter-spacing: 2px;
		color: var(--imperial-purple);
		overflow-x: auto;
		white-space: nowrap;
	}

	.del {
		background: var(--stone-gray);
		border: none;
		padding: 8px 14px;
		border-radius: 10px;
		cursor: pointer;
		font-weight: 700;
		font-size: 0.95rem;
		color: var(--charcoal);
		transition: background 0.15s;
	}

	.del:hover:not(:disabled) {
		background: #d8cfbe;
	}

	.rows {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.row {
		display: flex;
		gap: 8px;
		justify-content: center;
	}

	.key {
		flex: 1;
		max-width: 80px;
		background: white;
		border: 2px solid var(--stone-border);
		border-radius: 12px;
		padding: 12px 6px;
		font-size: 1.35rem;
		font-weight: 800;
		cursor: pointer;
		color: var(--charcoal);
		transition: all 0.12s;
		box-shadow: 0 3px 0 var(--stone-border);
	}

	.key:hover:not(:disabled) {
		border-color: var(--terracotta);
		background: #fffcf9;
	}

	.key:active:not(:disabled) {
		transform: translateY(2px);
		box-shadow: none;
	}

	.key.vinculum {
		background: #faf4ed;
		border-color: #dfcdb9;
		color: var(--imperial-purple);
	}

	.submit {
		margin-top: 4px;
		background: var(--terracotta);
		color: white;
		border: none;
		border-radius: 12px;
		padding: 14px;
		font-size: 1.15rem;
		font-weight: 800;
		cursor: pointer;
		box-shadow: 0 4px 12px rgba(194, 89, 63, 0.3);
		transition: all 0.2s;
	}

	.submit:hover:not(:disabled) {
		background: var(--terracotta-dark);
		transform: translateY(-1px);
	}

	button:disabled {
		opacity: 0.6;
		cursor: default;
	}

	@media (max-width: 600px) {
		.key {
			font-size: 1.15rem;
			padding: 10px 4px;
		}
	}
</style>
