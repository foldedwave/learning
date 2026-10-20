<script lang="ts">
	import StarCounter from '#lib/components/ui/StarCounter.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	// Child-adjustable text size (100%, 115%, 130%) scales every rem on the page
	$effect(() => {
		const root = document.documentElement;
		root.style.setProperty('--font-scale', String((data.learner?.fontScale ?? 100) / 100));
		return () => root.style.removeProperty('--font-scale');
	});
</script>

{#if data.preview}
	<p class="preview">
		Parent preview: answers are marked but nothing is recorded. <a href="/parent"
			>Back to parent area</a
		>
	</p>
{/if}

<header class="bar">
	<a class="home" href="/today"><span aria-hidden="true">🏠</span> My Day</a>
	<nav aria-label="Main">
		<a href="/progress">My Progress</a>
		<a href="/rewards">Rewards</a>
	</nav>
	<StarCounter stars={data.stars} />
	{#if data.learner}
		<form method="POST" action="/signout">
			<button class="who" title="Sign out">
				<span aria-hidden="true">{data.learner.avatar}</span>
				<span>{data.learner.name}</span>
				<span class="visually-hidden">: sign out</span>
			</button>
		</form>
	{/if}
</header>

<main>
	{@render children()}
</main>

<style>
	.preview {
		margin: 0;
		padding: var(--space-2) var(--space-4);
		background: var(--nudge-soft);
		text-align: center;
		font-size: var(--text-sm);
	}

	.bar {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		background: var(--surface);
		border-bottom: 2px solid var(--line);
	}

	.home,
	nav a,
	.who {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		min-height: var(--tap-min);
		padding-inline: var(--space-3);
		border-radius: var(--radius-md);
		font-weight: 600;
		text-decoration: none;
		white-space: nowrap;
	}

	.home {
		background: var(--ink);
		color: var(--surface);
	}

	nav {
		display: flex;
		gap: var(--space-1);
		flex: 1;
	}

	.who {
		border: 2px solid var(--line);
		background: var(--surface);
		cursor: pointer;
	}

	main {
		max-width: 60rem;
		margin: 0 auto;
		padding: var(--space-6) var(--space-4) var(--space-12);
	}
</style>
