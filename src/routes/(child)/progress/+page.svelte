<script lang="ts">
	import SteppingStones from '#lib/components/ui/SteppingStones.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>My Progress · Home Learning</title></svelte:head>

<h1>My Progress</h1>
<p class="lead">
	Each stone fills up as a skill grows: Learning, Developing, Secure, then Mastered 🌟.
</p>

{#each data.subjects as subject (subject.id)}
	<section class="subject-{subject.id}">
		<h2><span aria-hidden="true">{subject.icon}</span> {subject.title}</h2>
		{#each subject.strands as strand (strand.title)}
			<h3>{strand.title}</h3>
			<SteppingStones stones={strand.stones} />
		{:else}
			<p>Coming soon.</p>
		{/each}
	</section>
{/each}

<h2>Badges</h2>
<p>Badges are coming soon. Keep collecting stars!</p>

<style>
	.lead {
		color: var(--ink-soft);
	}

	section {
		margin-bottom: var(--space-8);
	}
</style>
