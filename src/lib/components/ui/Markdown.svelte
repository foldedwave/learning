<script lang="ts">
	import { renderMarkdown } from './markdown.ts';

	let { source }: { source: string } = $props();
</script>

<div class="markdown">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- escaped by renderMarkdown -->
	{@html renderMarkdown(source)}
</div>

<style>
	.markdown :global(ul) {
		margin: 0 0 var(--space-3);
		padding-left: var(--space-6);
	}

	.markdown :global(li) {
		margin-bottom: var(--space-1);
	}

	.markdown :global(p:last-child),
	.markdown :global(ul:last-child) {
		margin-bottom: 0;
	}
</style>
