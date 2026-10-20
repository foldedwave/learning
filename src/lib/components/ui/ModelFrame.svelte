<script lang="ts">
	import type { Snippet } from 'svelte';
	import SpeakButton from './SpeakButton.svelte';

	let {
		title,
		prompt,
		onreset,
		children
	}: { title: string; prompt: string; onreset?: () => void; children: Snippet } = $props();
</script>

<section class="model" aria-label={title}>
	<header>
		<h3>{title}</h3>
		<SpeakButton text={prompt} />
		{#if onreset}
			<button type="button" class="reset" onclick={onreset}>↺ Reset</button>
		{/if}
	</header>
	<p class="prompt">{prompt}</p>
	{@render children()}
</section>

<style>
	.model {
		border: 2px dashed var(--subject, var(--line));
		border-radius: var(--radius-lg);
		padding: var(--space-4);
		background: var(--surface);
	}

	header {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	h3 {
		flex: 1;
		margin: 0;
	}

	.reset {
		min-height: var(--tap-min);
		border: 2px solid var(--line);
		border-radius: var(--radius-md);
		background: var(--surface);
		padding-inline: var(--space-3);
		cursor: pointer;
	}

	.prompt {
		color: var(--ink-soft);
		margin-top: var(--space-2);
	}
</style>
