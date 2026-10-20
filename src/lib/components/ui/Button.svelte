<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Props = HTMLButtonAttributes & {
		variant?: 'primary' | 'secondary' | 'quiet';
		href?: string;
		children: Snippet;
	};

	let { variant = 'primary', href, children, type = 'button', ...rest }: Props = $props();
</script>

{#if href}
	<a class="button {variant}" {href}>{@render children()}</a>
{:else}
	<button class="button {variant}" {type} {...rest}>{@render children()}</button>
{/if}

<style>
	.button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		min-height: var(--tap-min);
		padding: var(--space-2) var(--space-6);
		border-radius: var(--radius-md);
		border: 2px solid transparent;
		font-weight: 600;
		font-size: var(--text-base);
		text-decoration: none;
		cursor: pointer;
		transition: transform var(--motion-fast);
	}

	.button:active:not(:disabled) {
		transform: scale(0.98);
	}

	.button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.primary {
		background: var(--subject, var(--ink));
		color: var(--surface);
	}

	.secondary {
		background: var(--surface);
		color: var(--subject, var(--ink));
		border-color: currentColor;
	}

	.quiet {
		background: transparent;
		color: var(--ink-soft);
		padding-inline: var(--space-3);
	}
</style>
