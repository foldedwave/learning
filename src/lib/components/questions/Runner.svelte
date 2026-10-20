<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { api } from '#lib/client/api.ts';
	import { getSkill, getTopic, makeQuestion, toView, topicPath } from '#lib/content/index.ts';
	import { createRng, newSeed } from '#lib/content/rng.ts';
	import type { Difficulty, QuestionView } from '#lib/content/types.ts';
	import { LEVEL_LABELS, type MasteryLevel } from '#lib/engine/mastery.ts';
	import {
		nextDifficulty,
		pickGenerator,
		showScaffold,
		startingDifficulty
	} from '#lib/engine/practice.ts';
	import type { AttemptResult, FinishResult } from '#lib/server/learning.ts';
	import LearnCardView from '../LearnCardView.svelte';
	import Button from '../ui/Button.svelte';
	import Celebration from '../ui/Celebration.svelte';
	import Feedback from '../ui/Feedback.svelte';
	import HintButton from '../ui/HintButton.svelte';
	import QuestionCard from './QuestionCard.svelte';

	let {
		topicId,
		skillId,
		level,
		mode,
		total,
		base
	}: {
		topicId: string;
		skillId: string;
		level: MasteryLevel;
		mode: 'practise' | 'check';
		/** Questions in a Check (10, or 5 for a review). Practise runs until the child stops. */
		total?: number;
		base: string;
	} = $props();

	/** Practise answers needed before the child can finish (and earn the session stars). */
	const PRACTISE_MIN = 5;

	const topic = $derived(getTopic(topicId)!);
	const generators = $derived(topic.generators.filter((g) => g.skillId === skillId));

	let sessionId = $state<number | null>(null);
	let question = $state.raw<QuestionView | null>(null);
	let result = $state.raw<AttemptResult | null>(null);
	let finished = $state.raw<FinishResult | null>(null);
	let selected = $state<string | null>(null);
	let hintsUsed = $state(0);
	let showHelp = $state(false);
	let celebrate = $state<string | null>(null);
	let busy = $state(false);
	let error = $state('');

	let answered = $state<boolean[]>([]);
	let difficulty: Difficulty = 1;
	let lastGenerator: number | null = null;
	let started = 0;
	let scaffolded = $state(false);

	const correctCount = $derived(answered.filter(Boolean).length);

	function next() {
		result = null;
		selected = null;
		hintsUsed = 0;
		showHelp = false;
		const index = pickGenerator(generators.length, lastGenerator, Math.random());
		lastGenerator = index;
		const seed = newSeed();
		if (mode === 'check') {
			// Checks use difficulty 2–3 with no hints
			difficulty = createRng(seed).chance(0.5) ? 2 : 3;
		}
		question = toView(makeQuestion(generators[index], seed, difficulty));
		scaffolded = mode === 'practise' && showScaffold(answered.length, level);
		started = performance.now();
	}

	onMount(async () => {
		difficulty = startingDifficulty(level);
		try {
			sessionId = (await api.startSession({ topicId, tab: mode, skillId })).id;
			next();
		} catch {
			error = 'Could not start. Check the connection and reload the page.';
		}
	});

	async function answer(response: string) {
		if (sessionId === null || !question || result || busy) return;
		busy = true;
		selected = response;
		try {
			result = await api.attempt({
				sessionId,
				topicId,
				itemId: question.itemId,
				response,
				hintsUsed,
				scaffolded,
				timeMs: Math.round(performance.now() - started)
			});
			answered.push(result.correct);
			if (mode === 'practise') difficulty = nextDifficulty(difficulty, answered);
			if (result.levelUp)
				celebrate = `Level up! ${getSkill(skillId)?.skill.title}: ${LEVEL_LABELS[result.level]}`;
			if (result.stars) void invalidateAll();
		} catch {
			error = 'That answer did not send. Try again.';
			selected = null;
		} finally {
			busy = false;
		}
	}

	async function finish() {
		if (sessionId === null) return;
		busy = true;
		try {
			finished = await api.finishSession(sessionId);
			const check = finished.check;
			if (check && check.to !== check.from) celebrate = `${LEVEL_LABELS[check.to]}! 🎉`;
			await invalidateAll();
		} finally {
			busy = false;
		}
	}

	const checkDone = $derived(mode === 'check' && total !== undefined && answered.length >= total);
</script>

{#if celebrate}
	<Celebration message={celebrate} ondone={() => (celebrate = null)} />
{/if}

{#if error}<p class="error" role="alert">{error}</p>{/if}

{#if finished}
	<section class="summary" aria-live="polite">
		{#if finished.check}
			<h2>{finished.check.review ? 'Review' : 'Check'} complete</h2>
			<p class="score">{finished.check.correct} out of {finished.check.total}</p>
			{#if finished.check.to !== finished.check.from}
				<p>
					You moved from <strong>{LEVEL_LABELS[finished.check.from]}</strong> to
					<strong>{LEVEL_LABELS[finished.check.to]}</strong>!
				</p>
			{:else if finished.check.to === 'secure' || finished.check.to === 'mastered'}
				<p>Still <strong>{LEVEL_LABELS[finished.check.to]}</strong>. Great remembering!</p>
			{:else}
				<p>You need 8 out of 10 to reach Secure. A bit more practice will get you there.</p>
			{/if}
		{:else}
			<h2>Great practising! 💪</h2>
			<p>{correctCount} correct out of {answered.length}.</p>
		{/if}
		{#if finished.stars}<p>You earned <strong>{finished.stars} ⭐</strong>.</p>{/if}
		<div class="actions">
			{#if mode === 'practise'}
				<Button href="{base}/check">Try the Check →</Button>
			{:else if finished.check && (finished.check.to === 'secure' || finished.check.to === 'mastered')}
				<Button href="{base}/stretch">Try a Stretch challenge →</Button>
			{:else}
				<Button href="{base}/practise">Practise some more →</Button>
			{/if}
			<Button variant="quiet" href="/today">Back to My Day</Button>
		</div>
	</section>
{:else if question}
	<p class="progress" aria-live="polite">
		{#if mode === 'check'}Question {Math.min(answered.length + (result ? 0 : 1), total ?? 0)} of {total}{:else}Answered
			{answered.length} · {correctCount} correct{/if}
	</p>

	<QuestionCard
		{question}
		{selected}
		disabled={!!result || busy}
		showScaffold={scaffolded}
		onanswer={answer}
	/>

	{#if mode === 'practise' && !result}
		<div class="hints"><HintButton hints={question.hints} bind:used={hintsUsed} /></div>
	{/if}

	{#if result}
		<Feedback
			correct={result.correct}
			message={result.feedback}
			explanation={result.explanation}
			answer={result.answer}
		/>
		{#if result.stuck}
			<div class="stuck">
				{#if !showHelp}
					<Button variant="secondary" onclick={() => (showHelp = true)}
						>🔄 Show me another way</Button
					>
				{:else}
					{#each result.stuck.cards as card, i (i)}
						{#if card.kind !== 'check-in' && card.kind !== 'oak-video'}<LearnCardView {card} />{/if}
					{/each}
					{#each result.stuck.prerequisites as pre (pre.skillId)}
						{@const preTopic = getTopic(pre.topicId)}
						{#if preTopic}
							<p>
								It might help to warm up on <a
									href="{topicPath(preTopic)}/practise?skill={pre.skillId}">{pre.title}</a
								> first.
							</p>
						{/if}
					{/each}
				{/if}
			</div>
		{/if}
		<div class="actions">
			{#if checkDone}
				<Button disabled={busy} onclick={finish}>See my result →</Button>
			{:else}
				<Button onclick={next}>Next question →</Button>
				{#if mode === 'practise' && answered.length >= PRACTISE_MIN}
					<Button variant="secondary" disabled={busy} onclick={finish}>I'm finished</Button>
				{/if}
			{/if}
		</div>
	{/if}
{/if}

<style>
	.progress {
		color: var(--ink-soft);
		font-size: var(--text-sm);
	}

	.hints {
		margin-top: var(--space-4);
	}

	.stuck {
		display: grid;
		gap: var(--space-4);
		margin-bottom: var(--space-4);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		margin-top: var(--space-4);
	}

	.summary {
		max-width: var(--measure);
	}

	.score {
		font-size: var(--text-2xl);
		font-weight: 600;
	}

	.error {
		color: var(--nudge);
		font-weight: 600;
	}
</style>
