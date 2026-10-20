<script lang="ts">
	import Card from '#lib/components/ui/Card.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const hasPlan = $derived(
		!!data.continueTopic || data.reviews.length > 0 || data.suggestions.length > 0
	);
</script>

<svelte:head><title>My Day · Home Learning</title></svelte:head>

<h1>Hello {data.name}! 👋</h1>
<p class="lead">Here's what's next. Weekly plans arrive soon; until then, pick from these.</p>

<section aria-labelledby="today-heading">
	<h2 id="today-heading" class="visually-hidden">Today</h2>
	<div class="cards">
		{#each data.reviews as review, i (review.skillId)}
			<div class="subject-{review.subject}">
				<Card href={review.href} icon="🔁" title="Review: {review.title}" highlight={i === 0}>
					A quick 5-question check to keep it fresh
				</Card>
			</div>
		{/each}
		{#if data.continueTopic}
			<div class="subject-{data.continueTopic.subject}">
				<Card
					href={data.continueTopic.href}
					icon={data.continueTopic.icon}
					title="Continue: {data.continueTopic.title}"
					highlight={!data.reviews.length}
				>
					Pick up where you left off
				</Card>
			</div>
		{/if}
		{#each data.suggestions as topic, i (topic.href)}
			<div class="subject-{topic.subject}">
				<Card
					href={topic.href}
					icon={topic.icon}
					title={topic.title}
					highlight={!data.reviews.length && !data.continueTopic && i === 0}
				>
					{topic.summary}
				</Card>
			</div>
		{/each}
		{#if !hasPlan}
			<p>You're all caught up. Brilliant work! Try a Stretch challenge, or pick something below.</p>
		{/if}
	</div>
</section>

<section aria-labelledby="pick-heading">
	<h2 id="pick-heading">Pick something myself</h2>
	<div class="subjects">
		{#each data.subjects as subject (subject.id)}
			<div class="subject-{subject.id}">
				<Card href="/{subject.id}" icon={subject.icon} title={subject.title} />
			</div>
		{/each}
	</div>
</section>

<style>
	.lead {
		color: var(--ink-soft);
	}

	.cards {
		display: grid;
		gap: var(--space-4);
		margin-bottom: var(--space-8);
	}

	.subjects {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
		gap: var(--space-4);
	}
</style>
