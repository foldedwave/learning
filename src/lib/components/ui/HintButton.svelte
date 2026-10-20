<script lang="ts">
	import Button from './Button.svelte';
	import Markdown from './Markdown.svelte';

	let {
		hints,
		used = $bindable(0),
		disabled = false
	}: { hints: string[]; used?: number; disabled?: boolean } = $props();
</script>

{#if used > 0}
	<ol class="hints" aria-live="polite">
		{#each hints.slice(0, used) as hint, i (i)}
			<li><span aria-hidden="true">💡</span> <Markdown source={hint} /></li>
		{/each}
	</ol>
{/if}
{#if used < hints.length}
	<Button variant="secondary" {disabled} onclick={() => used++}>
		<span aria-hidden="true">💡</span>
		{used === 0 ? 'Hint' : 'Another hint'}
	</Button>
{/if}

<style>
	.hints {
		list-style: none;
		padding: 0;
		margin: 0 0 var(--space-3);
	}

	li {
		display: flex;
		gap: var(--space-2);
		background: var(--surface-soft);
		border-radius: var(--radius-sm);
		padding: var(--space-2) var(--space-3);
		margin-bottom: var(--space-2);
	}
</style>
