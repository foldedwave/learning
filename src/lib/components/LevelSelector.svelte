<script lang="ts">
	import { getQuest } from '../roman/context';
	import type { Concept } from '../roman/types';

	let { curriculum }: { curriculum: Concept[] } = $props();

	const { progress, game } = getQuest();
</script>

<section>
	<div class="title">
		<span>🎯 Select a Concept Level</span>
		<span class="hint">(Jump to any level anytime!)</span>
	</div>
	<div class="pills">
		{#each curriculum as c (c.id)}
			{@const stars = progress.levels[c.id]?.stars ?? 0}
			<button
				type="button"
				class="pill"
				class:active={c.id === progress.currentLevelId}
				aria-pressed={c.id === progress.currentLevelId}
				onclick={() => game.selectLevel(c.id)}
			>
				<span class="lvl">Lvl {c.id}</span>
				<span class="name" title={c.title}>{c.shortName}</span>
				<span class="stars">{'★'.repeat(stars) || '☆ 0'}</span>
			</button>
		{/each}
	</div>
</section>

<style>
	section {
		background: var(--card-bg);
		border-radius: var(--radius);
		padding: 16px;
		box-shadow: var(--shadow);
		border: 2px solid var(--stone-border);
		margin-bottom: 22px;
	}

	.title {
		font-weight: 800;
		color: var(--imperial-purple);
		font-size: 1rem;
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 12px;
	}

	.hint {
		font-size: 0.8rem;
		font-weight: normal;
		color: #6b605b;
	}

	.pills {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(95px, 1fr));
		gap: 8px;
	}

	.pill {
		display: block;
		background: var(--stone-gray);
		color: inherit;
		border: 2px solid transparent;
		border-radius: 12px;
		padding: 8px 6px;
		text-align: center;
		cursor: pointer;
		transition: all 0.2s;
		min-width: 0;
	}

	.pill:hover {
		border-color: var(--terracotta);
		background: #f4eee3;
	}

	.pill.active {
		background: var(--imperial-purple);
		color: white;
		border-color: var(--laurel-gold);
		transform: scale(1.03);
		box-shadow: 0 4px 10px rgba(74, 37, 69, 0.25);
	}

	.lvl {
		display: block;
		font-size: 0.75rem;
		text-transform: uppercase;
		font-weight: 800;
		opacity: 0.85;
	}

	.active .lvl {
		color: var(--laurel-gold-light);
	}

	.name {
		display: block;
		font-size: 0.78rem;
		font-weight: 700;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.stars {
		display: block;
		font-size: 0.7rem;
		color: var(--laurel-gold);
		margin-top: 2px;
	}

	.active .stars {
		color: #ffd700;
	}
</style>
