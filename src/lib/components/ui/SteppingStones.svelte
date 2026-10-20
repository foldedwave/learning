<script lang="ts">
	import { LEVEL_LABELS, type MasteryLevel } from '#lib/engine/mastery.ts';

	let {
		stones
	}: { stones: { title: string; level: MasteryLevel; href?: string; lockedBy?: string }[] } =
		$props();

	const fill: Record<MasteryLevel, number> = {
		'not-started': 0,
		learning: 1,
		developing: 2,
		secure: 3,
		mastered: 4
	};
</script>

<ol class="path">
	{#each stones as stone, i (i)}
		<li class="stone" data-fill={fill[stone.level]}>
			<span class="marker" aria-hidden="true"
				>{fill[stone.level] === 4 ? '🌟' : fill[stone.level] === 3 ? '✔' : i + 1}</span
			>
			<span class="body">
				{#if stone.href && !stone.lockedBy}
					<a href={stone.href}>{stone.title}</a>
				{:else}
					<span>{stone.title}</span>
				{/if}
				<span class="detail">
					{#if stone.lockedBy}🔒 Unlocks after {stone.lockedBy}{:else}{LEVEL_LABELS[
							stone.level
						]}{/if}
				</span>
			</span>
		</li>
	{/each}
</ol>

<style>
	.path {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-3);
	}

	.stone {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		background: var(--surface);
		border: 2px solid var(--line);
		border-radius: var(--radius-lg);
		padding: var(--space-3) var(--space-4);
	}

	.marker {
		display: grid;
		place-items: center;
		width: var(--tap-min);
		height: var(--tap-min);
		border-radius: 50%;
		border: 3px solid var(--subject, var(--ink-soft));
		font-weight: 600;
		flex-shrink: 0;
		background: var(--surface);
	}

	[data-fill='1'] .marker {
		background: linear-gradient(
			to top,
			color-mix(in srgb, var(--subject) 25%, white) 25%,
			var(--surface) 25%
		);
	}
	[data-fill='2'] .marker {
		background: linear-gradient(
			to top,
			color-mix(in srgb, var(--subject) 25%, white) 60%,
			var(--surface) 60%
		);
	}
	[data-fill='3'] .marker,
	[data-fill='4'] .marker {
		background: var(--subject);
		color: var(--surface);
	}

	.body {
		display: flex;
		flex-direction: column;
	}

	a,
	.body > span:first-child {
		font-weight: 600;
		font-size: var(--text-lg);
	}

	.detail {
		color: var(--ink-soft);
		font-size: var(--text-sm);
	}
</style>
