<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { api } from '#lib/client/api.ts';
	import { getGenerator, makeQuestion, toView } from '#lib/content/index.ts';
	import { newSeed } from '#lib/content/rng.ts';
	import LearnCardView from '#lib/components/LearnCardView.svelte';
	import QuestionCard from '#lib/components/questions/QuestionCard.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Feedback from '#lib/components/ui/Feedback.svelte';
	import type { AttemptResult, FinishResult } from '#lib/server/learning.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// Our own cards; Oak videos join after them in Phase 2
	const cards = $derived(data.learn.filter((c) => c.kind !== 'oak-video'));
	let index = $state(0);
	let sessionId = $state<number | null>(null);
	let checkResult = $state<AttemptResult | null>(null);
	let finished = $state<FinishResult | null>(null);
	let error = $state('');
	let started = 0;

	const card = $derived(cards[index]);
	const checkIn = $derived.by(() => {
		if (card?.kind !== 'check-in') return null;
		const generator = getGenerator(card.generatorId);
		return generator ? toView(makeQuestion(generator, newSeed(), card.difficulty)) : null;
	});

	onMount(async () => {
		try {
			sessionId = (await api.startSession({ topicId: data.topicId, tab: 'learn' })).id;
		} catch {
			error = 'Could not start. Check the connection and reload the page.';
		}
	});

	$effect(() => {
		if (checkIn) started = performance.now();
	});

	async function answer(response: string) {
		if (sessionId === null || !checkIn) return;
		checkResult = await api.attempt({
			sessionId,
			topicId: data.topicId,
			itemId: checkIn.itemId,
			response,
			hintsUsed: 0,
			scaffolded: false,
			timeMs: performance.now() - started
		});
	}

	async function finish() {
		if (sessionId === null) return;
		finished = await api.finishSession(sessionId);
		await invalidateAll();
	}
</script>

<svelte:head><title>Learn · {data.topicTitle}</title></svelte:head>

{#if error}<p role="alert">{error}</p>{/if}

{#if finished}
	<section class="done">
		<h2>Nice learning! 🎓</h2>
		{#if finished.stars}<p>You earned <strong>{finished.stars} ⭐</strong>.</p>{/if}
		<Button href="{data.base}/practise">Start practising →</Button>
		<Button variant="quiet" href="/today">Back to My Day</Button>
	</section>
{:else if card}
	<p class="progress" aria-live="polite">Card {index + 1} of {cards.length}</p>
	{#key index}
		{#if card.kind === 'check-in'}
			<section class="check-in">
				<h2>{card.title}</h2>
				{#if checkIn}
					<QuestionCard
						question={checkIn}
						disabled={!!checkResult || sessionId === null}
						onanswer={answer}
					/>
				{/if}
				{#if checkResult}
					<Feedback
						correct={checkResult.correct}
						message={checkResult.correct ? "Yes! You've got the idea." : checkResult.feedback}
						explanation={checkResult.explanation}
						answer={checkResult.answer}
					/>
					{#if !checkResult.correct}
						<p>No problem. Practise starts with extra help, or go back through the cards.</p>
					{/if}
				{/if}
			</section>
		{:else}
			<LearnCardView {card} />
		{/if}
	{/key}

	<div class="nav">
		<Button
			variant="secondary"
			disabled={index === 0}
			onclick={() => {
				index--;
				checkResult = null;
			}}>← Back</Button
		>
		{#if index < cards.length - 1}
			<Button onclick={() => index++}>Next →</Button>
		{:else}
			<Button
				disabled={sessionId === null || (card.kind === 'check-in' && !checkResult)}
				onclick={finish}>I'm done learning ✓</Button
			>
		{/if}
	</div>
{/if}

<style>
	.progress {
		color: var(--ink-soft);
		font-size: var(--text-sm);
	}

	.nav {
		display: flex;
		justify-content: space-between;
		gap: var(--space-3);
		margin-top: var(--space-6);
		max-width: var(--measure);
	}

	.check-in,
	.done {
		max-width: var(--measure);
	}

	.done {
		display: grid;
		gap: var(--space-3);
		justify-items: start;
	}
</style>
