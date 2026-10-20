<script lang="ts">
	import type { Concept } from '../roman/types';
	import LessonModal from './LessonModal.svelte';

	let { concept }: { concept: Concept } = $props();

	let lessonOpen = $state(false);
</script>

<aside>
	<div>
		<span class="concept-tag">{concept.tag}</span>
		<h2>{concept.title}</h2>
	</div>
	<p class="body">{concept.description}</p>
	<div class="tip">
		<strong>Owl Titus's Tip:</strong>
		{concept.tip}
	</div>
	<button type="button" onclick={() => (lessonOpen = true)}>
		<span>📖</span> Read Full Interactive Lesson
	</button>
</aside>

<LessonModal bind:open={lessonOpen} {concept} />

<style>
	aside {
		background: var(--card-bg);
		border-radius: var(--radius);
		padding: 20px;
		border: 2px solid var(--stone-border);
		box-shadow: var(--shadow);
		display: flex;
		flex-direction: column;
		gap: 14px;
		align-self: start;
	}

	h2 {
		font-size: 1.25rem;
		font-weight: 800;
		color: var(--imperial-purple);
		line-height: 1.25;
		margin-top: 6px;
	}

	.body {
		font-size: 0.92rem;
		color: #443c39;
	}

	.tip {
		background: #fdf5ea;
		border-left: 4px solid var(--terracotta);
		padding: 10px 12px;
		border-radius: 0 10px 10px 0;
		font-size: 0.88rem;
	}

	button {
		background: var(--stone-gray);
		color: var(--charcoal);
		border: 1px solid var(--stone-border);
		padding: 10px;
		border-radius: 12px;
		font-weight: 700;
		font-size: 0.9rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		transition: all 0.2s;
	}

	button:hover {
		background: var(--terracotta);
		color: white;
		border-color: var(--terracotta);
	}
</style>
