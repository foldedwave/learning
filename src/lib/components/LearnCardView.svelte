<script lang="ts">
	import type { LearnCard } from '#lib/content/types.ts';
	import Markdown from './ui/Markdown.svelte';
	import SpeakButton from './ui/SpeakButton.svelte';
	import { MODELS } from './models/index.ts';

	let { card }: { card: Exclude<LearnCard, { kind: 'check-in' } | { kind: 'oak-video' }> } =
		$props();

	const Model = $derived(card.kind === 'model' ? MODELS[card.model] : undefined);
</script>

{#if card.kind === 'model'}
	{#if Model}
		<Model title={card.title} prompt={card.prompt} {...card.props} />
	{/if}
{:else}
	<article class="learn-card">
		<header>
			<h2>{card.title}</h2>
			<SpeakButton
				text={card.kind === 'explain'
					? (card.speak ?? `${card.title}. ${card.body}`)
					: `${card.title}. ${card.steps.map((s) => `${s.text} ${s.highlight ?? ''}`).join('. ')}`}
			/>
		</header>
		{#if card.kind === 'explain'}
			<Markdown source={card.body} />
		{:else}
			<ol class="steps">
				{#each card.steps as step, i (i)}
					<li>
						<span>{step.text}</span>
						{#if step.highlight}<strong class="highlight">{step.highlight}</strong>{/if}
					</li>
				{/each}
			</ol>
		{/if}
	</article>
{/if}

<style>
	.learn-card {
		background: var(--surface);
		border-radius: var(--radius-lg);
		border: 2px solid var(--line);
		border-top: 8px solid var(--subject, var(--ink-soft));
		padding: var(--space-6);
		box-shadow: var(--shadow-card);
		max-width: var(--measure);
	}

	header {
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
	}

	h2 {
		flex: 1;
	}

	.steps {
		display: grid;
		gap: var(--space-3);
		padding-left: var(--space-6);
		margin: 0;
	}

	.steps li {
		display: grid;
		gap: var(--space-1);
	}

	.highlight {
		font-size: var(--text-lg);
		color: var(--subject, var(--ink));
		letter-spacing: 0.03em;
	}
</style>
