<script lang="ts">
	let {
		choices,
		correct,
		selected,
		answered,
		onpick
	}: {
		choices: string[];
		correct: string;
		selected: string | null;
		answered: boolean;
		onpick: (choice: string) => void;
	} = $props();
</script>

<div class="grid">
	{#each choices as choice (choice)}
		<button
			type="button"
			class="choice"
			class:correct={answered && choice === correct}
			class:incorrect={answered && choice === selected && choice !== correct}
			disabled={answered}
			onclick={() => onpick(choice)}
		>
			{choice}
		</button>
	{/each}
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
	}

	.choice {
		background: white;
		border: 2px solid var(--stone-border);
		border-radius: 14px;
		padding: 18px 10px;
		font-size: 1.45rem;
		font-weight: 800;
		color: var(--charcoal);
		cursor: pointer;
		transition: all 0.15s ease-out;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 70px;
	}

	.choice:hover:not(:disabled) {
		border-color: var(--terracotta);
		transform: translateY(-2px);
		box-shadow: 0 6px 14px rgba(194, 89, 63, 0.15);
		background: #fffcfb;
	}

	.choice:disabled {
		cursor: default;
	}

	.choice.correct {
		background: #e8f5e9;
		border-color: var(--olive-green);
		color: var(--olive-green);
	}

	.choice.incorrect {
		background: #ffebee;
		border-color: #c62828;
		color: #c62828;
	}

	@media (max-width: 600px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}
</style>
