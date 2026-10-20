<script lang="ts">
	import Breadcrumb from '#lib/components/ui/Breadcrumb.svelte';
	import Card from '#lib/components/ui/Card.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>{data.title} · Home Learning</title></svelte:head>

<div class="subject-{data.subject}">
	<Breadcrumb items={[{ label: data.title }]} />
	<h1>{data.title}</h1>
	{#if data.strands.length === 0}
		<p>{data.title} is coming soon. Have a look at Maths in the meantime!</p>
	{/if}
	<div class="strands">
		{#each data.strands as strand (strand.slug)}
			<Card
				href={strand.skillCount ? `/${data.subject}/${strand.slug}` : undefined}
				icon={strand.icon}
				title={strand.title}
			>
				{#if strand.skillCount}
					<progress
						max={strand.skillCount}
						value={strand.secureCount}
						aria-label="{strand.secureCount} of {strand.skillCount} skills secure"
					></progress>
				{:else}
					Coming soon
				{/if}
			</Card>
		{/each}
	</div>
</div>

<style>
	.strands {
		display: grid;
		gap: var(--space-4);
	}

	progress {
		width: 100%;
		max-width: 16rem;
		height: 0.75rem;
		accent-color: var(--subject);
	}
</style>
