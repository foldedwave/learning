<script lang="ts">
	import { page } from '$app/state';

	let { base, stretchLocked }: { base: string; stretchLocked: boolean } = $props();

	const tabs = [
		{ slug: 'learn', label: 'Learn', icon: '📘' },
		{ slug: 'practise', label: 'Practise', icon: '✏️' },
		{ slug: 'check', label: 'Check', icon: '✅' },
		{ slug: 'stretch', label: 'Stretch', icon: '🧗' }
	];
</script>

<nav class="tabs" aria-label="Topic sections">
	{#each tabs as tab (tab.slug)}
		{@const href = `${base}/${tab.slug}`}
		<a {href} aria-current={page.url.pathname === href ? 'page' : undefined}>
			<span aria-hidden="true">{tab.icon}</span>
			{tab.label}
			{#if tab.slug === 'stretch' && stretchLocked}<span aria-label="(locked)">🔒</span>{/if}
		</a>
	{/each}
</nav>

<style>
	.tabs {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--space-2);
		margin-bottom: var(--space-6);
	}

	a {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		min-height: var(--tap-min);
		padding: var(--space-2);
		border-radius: var(--radius-md);
		background: var(--surface);
		border: 2px solid var(--line);
		text-decoration: none;
		font-weight: 600;
	}

	a[aria-current='page'] {
		background: var(--subject);
		border-color: var(--subject);
		color: var(--surface);
	}

	@media (max-width: 520px) {
		.tabs {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
