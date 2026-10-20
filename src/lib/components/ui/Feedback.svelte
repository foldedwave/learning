<script lang="ts">
	import Markdown from './Markdown.svelte';

	let {
		correct,
		message,
		explanation,
		answer
	}: { correct: boolean; message: string; explanation?: string; answer?: string } = $props();
</script>

<div class="feedback" class:correct role="status">
	<p class="headline">
		<span aria-hidden="true">{correct ? '✔️' : '🤔'}</span>
		<Markdown source={message} />
	</p>
	{#if !correct && answer}
		<p>The answer is <strong>{answer}</strong>.</p>
	{/if}
	{#if explanation}<Markdown source={explanation} />{/if}
</div>

<style>
	.feedback {
		border-radius: var(--radius-md);
		padding: var(--space-4);
		border: 2px solid var(--nudge);
		background: var(--nudge-soft);
		margin-block: var(--space-4);
	}

	.correct {
		border-color: var(--good);
		background: var(--good-soft);
	}

	.headline {
		display: flex;
		gap: var(--space-2);
		font-weight: 600;
	}
</style>
