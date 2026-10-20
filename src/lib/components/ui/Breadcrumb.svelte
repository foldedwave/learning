<script lang="ts">
	let { items }: { items: { label: string; href?: string }[] } = $props();
</script>

<nav aria-label="Breadcrumb">
	<ol>
		{#each items as item, i (i)}
			<li>
				{#if item.href && i < items.length - 1}
					<a href={item.href}>{item.label}</a>
				{:else}
					<span aria-current={i === items.length - 1 ? 'page' : undefined}>{item.label}</span>
				{/if}
			</li>
		{/each}
	</ol>
</nav>

<style>
	ol {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		list-style: none;
		margin: 0 0 var(--space-4);
		padding: 0;
		color: var(--ink-soft);
		font-size: var(--text-sm);
	}

	li + li::before {
		content: '›';
		margin-right: var(--space-2);
	}

	a {
		display: inline-block;
		padding-block: var(--space-1);
	}
</style>
