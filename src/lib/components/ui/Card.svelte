<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		href,
		icon,
		title,
		highlight = false,
		locked = false,
		children
	}: {
		href?: string;
		icon?: string;
		title: string;
		highlight?: boolean;
		locked?: boolean;
		children?: Snippet;
	} = $props();
</script>

{#snippet body()}
	{#if icon}<span class="icon" aria-hidden="true">{icon}</span>{/if}
	<span class="text">
		<span class="title">{title}</span>
		{#if children}<span class="detail">{@render children()}</span>{/if}
	</span>
	{#if locked}<span class="lock" aria-label="Locked">🔒</span>{/if}
{/snippet}

{#if href && !locked}
	<a class="card" class:highlight {href}>{@render body()}</a>
{:else}
	<div class="card" class:highlight class:locked>{@render body()}</div>
{/if}

<style>
	.card {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		min-height: calc(var(--tap-min) * 1.75);
		padding: var(--space-4) var(--space-6);
		background: var(--surface);
		border: 2px solid var(--line);
		border-left: 8px solid var(--subject, var(--ink-soft));
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-card);
		text-decoration: none;
		color: var(--ink);
	}

	a.card:hover {
		border-color: var(--subject, var(--ink-soft));
	}

	.highlight {
		border-color: var(--subject, var(--ink));
		box-shadow: 0 0 0 4px color-mix(in srgb, var(--subject, var(--ink)) 20%, transparent);
	}

	.locked {
		opacity: 0.65;
	}

	.icon {
		font-size: var(--text-2xl);
	}

	.text {
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	.title {
		font-weight: 600;
		font-size: var(--text-lg);
	}

	.detail {
		color: var(--ink-soft);
		font-size: var(--text-sm);
	}
</style>
