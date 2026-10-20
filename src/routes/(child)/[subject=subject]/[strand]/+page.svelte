<script lang="ts">
	import Breadcrumb from '#lib/components/ui/Breadcrumb.svelte';
	import SteppingStones from '#lib/components/ui/SteppingStones.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>{data.strand.title} · Home Learning</title></svelte:head>

<div class="subject-{data.subject}">
	<Breadcrumb
		items={[{ label: data.subjectTitle, href: `/${data.subject}` }, { label: data.strand.title }]}
	/>
	<h1><span aria-hidden="true">{data.strand.icon}</span> {data.strand.title}</h1>
	<SteppingStones stones={data.stones} />
	{#if data.stones.length === 1}
		<p class="soon">More topics are on their way.</p>
	{/if}
</div>

<style>
	.soon {
		margin-top: var(--space-6);
		color: var(--ink-soft);
	}
</style>
