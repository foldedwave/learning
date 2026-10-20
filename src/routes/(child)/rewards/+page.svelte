<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Rewards · Home Learning</title></svelte:head>

<h1>Rewards</h1>
<p class="balance">You have <strong>{data.stars} ⭐</strong></p>
<p class="lead">
	Stars come from correct answers, finishing sessions, levelling up and trying Stretch challenges.
	Badges and family rewards are coming soon.
</p>

<h2>Recent stars</h2>
{#if data.recent.length}
	<ul>
		{#each data.recent as event (event.id)}
			<li><span class="stars">+{event.stars} ⭐</span> {event.reason}</li>
		{/each}
	</ul>
{:else}
	<p>No stars yet. Start a topic to earn some!</p>
{/if}

<style>
	.balance {
		font-size: var(--text-xl);
	}

	.lead {
		color: var(--ink-soft);
	}

	ul {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--space-2);
	}

	li {
		background: var(--surface);
		border: 2px solid var(--line);
		border-radius: var(--radius-md);
		padding: var(--space-2) var(--space-4);
	}

	.stars {
		font-weight: 600;
		color: var(--star);
		margin-right: var(--space-2);
	}
</style>
