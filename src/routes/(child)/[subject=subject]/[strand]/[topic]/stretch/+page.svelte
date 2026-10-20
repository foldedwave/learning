<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { api } from '#lib/client/api.ts';
	import Button from '#lib/components/ui/Button.svelte';
	import Markdown from '#lib/components/ui/Markdown.svelte';
	import SpeakButton from '#lib/components/ui/SpeakButton.svelte';
	import type { StretchResult } from '#lib/server/learning.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let tryAnyway = $state(false);
	let sessionId: number | null = null;
	let responses = $state<Record<string, string>>({});
	let results = $state<Record<string, StretchResult>>({});
	let error = $state('');
	const opened = performance.now();

	async function submit(event: SubmitEvent, taskId: string) {
		event.preventDefault();
		error = '';
		try {
			sessionId ??= (await api.startSession({ topicId: data.topicId, tab: 'stretch' })).id;
			results[taskId] = await api.stretch({
				sessionId,
				topicId: data.topicId,
				taskId,
				response: responses[taskId] ?? '',
				timeMs: Math.round(performance.now() - opened)
			});
			if (results[taskId].stars) void invalidateAll();
		} catch {
			error = 'That did not send. Try again.';
		}
	}

	async function done() {
		if (sessionId !== null) await api.finishSession(sessionId);
		sessionId = null;
		await invalidateAll();
	}
</script>

<svelte:head><title>Stretch · {data.topicTitle}</title></svelte:head>

{#if data.stretchLocked && !tryAnyway}
	<section class="locked">
		<h2>🔒 Stretch opens when a skill is Secure</h2>
		<p>Pass a Check first, and these puzzles will be waiting for you.</p>
		<Button href="{data.base}/check">Go to Check</Button>
		<Button variant="secondary" onclick={() => (tryAnyway = true)}>I want to try anyway</Button>
	</section>
{:else}
	<p class="intro">Puzzles and problems to stretch your thinking. Each one you try earns stars.</p>
	{#if error}<p class="error" role="alert">{error}</p>{/if}
	<div class="tasks">
		{#each data.tasks as task (task.id)}
			{@const result = results[task.id]}
			<article class="task">
				<header>
					<h2>{task.title}</h2>
					<SpeakButton text={task.prompt} />
				</header>
				<Markdown source={task.prompt} />
				<form onsubmit={(e) => submit(e, task.id)}>
					<label class="visually-hidden" for="answer-{task.id}">Your answer</label>
					{#if task.open}
						<textarea
							id="answer-{task.id}"
							rows="3"
							bind:value={responses[task.id]}
							disabled={!!result}></textarea>
					{:else}
						<input
							id="answer-{task.id}"
							bind:value={responses[task.id]}
							disabled={!!result}
							autocomplete="off"
						/>
					{/if}
					{#if !result}<Button type="submit" disabled={!responses[task.id]?.trim()}
							>{task.open ? 'Share my idea' : 'Check'}</Button
						>{/if}
				</form>
				{#if result}
					<div class="result" class:good={result.correct !== false} role="status">
						{#if result.correct === true}<p><strong>✔️ Spot on!</strong></p>
						{:else if result.correct === false}<p>
								<strong>🤔 Not quite. Here's one way to think about it:</strong>
							</p>
						{:else}<p><strong>💭 Great thinking! Compare your idea with this:</strong></p>{/if}
						<Markdown source={result.modelAnswer} />
						{#if result.stars}<p>+{result.stars} ⭐</p>{/if}
					</div>
				{/if}
			</article>
		{/each}
	</div>

	{#if data.resources.length}
		<section class="resources">
			<h2>See it another way</h2>
			<ul>
				{#each data.resources as resource (resource.url)}
					<li>
						<a href={resource.url} target="_blank" rel="noopener noreferrer">{resource.title}</a>
						({resource.source})
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	<div class="actions">
		<Button variant="secondary" onclick={done} href={undefined}>I'm done</Button>
		<Button variant="quiet" href="/today">Back to My Day</Button>
	</div>
{/if}

<style>
	.intro {
		color: var(--ink-soft);
	}

	.tasks {
		display: grid;
		gap: var(--space-4);
	}

	.task,
	.locked {
		background: var(--surface);
		border: 2px solid var(--line);
		border-radius: var(--radius-lg);
		padding: var(--space-6);
		max-width: var(--measure);
	}

	.locked {
		display: grid;
		gap: var(--space-3);
		justify-items: start;
	}

	header {
		display: flex;
		gap: var(--space-3);
		align-items: flex-start;
	}

	h2 {
		flex: 1;
		font-size: var(--text-lg);
	}

	form {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		margin-top: var(--space-3);
	}

	input,
	textarea {
		flex: 1;
		min-width: 12rem;
		min-height: var(--tap-min);
		border: 2px solid var(--line);
		border-radius: var(--radius-md);
		padding: var(--space-2) var(--space-3);
	}

	.result {
		margin-top: var(--space-3);
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-md);
		background: var(--nudge-soft);
	}

	.result.good {
		background: var(--good-soft);
	}

	.resources {
		margin-top: var(--space-8);
	}

	.actions {
		display: flex;
		gap: var(--space-3);
		margin-top: var(--space-6);
	}

	.error {
		color: var(--nudge);
		font-weight: 600;
	}
</style>
