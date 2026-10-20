<script lang="ts">
	import type { QuestionView } from '#lib/content/types.ts';
	import { BAR } from '#lib/content/maths/number/roman-numerals/convert.ts';
	import Button from '../ui/Button.svelte';
	import Markdown from '../ui/Markdown.svelte';
	import SpeakButton from '../ui/SpeakButton.svelte';
	import RomanKeypad from './RomanKeypad.svelte';

	let {
		question,
		disabled = false,
		showScaffold = false,
		selected = null,
		onanswer
	}: {
		question: QuestionView;
		disabled?: boolean;
		showScaffold?: boolean;
		/** The choice the child picked, to keep it highlighted after answering. */
		selected?: string | null;
		onanswer: (response: string) => void;
	} = $props();

	let text = $state('');

	function key(k: string) {
		if (k === '⌫') {
			text = text.slice(0, text.endsWith(BAR) ? -2 : -1);
		} else {
			text += k;
		}
	}

	function submit(event: SubmitEvent) {
		event.preventDefault();
		if (text.trim()) onanswer(text.trim());
	}
</script>

<section class="question" aria-labelledby="question-prompt">
	<div class="prompt-row">
		<div id="question-prompt" class="prompt"><Markdown source={question.prompt} /></div>
		<SpeakButton text={question.speak ?? question.prompt} label="Read the question aloud" />
	</div>

	{#if showScaffold && question.scaffold}
		<div class="scaffold" aria-label="Worked steps">
			{#each question.scaffold as step, i (i)}
				<p>
					{step.text}{#if step.blank}<span class="blank">?</span>{/if}
				</p>
			{/each}
		</div>
	{/if}

	{#if question.type === 'choice'}
		<div class="choices">
			{#each question.choices ?? [] as choice (choice.value)}
				<button
					type="button"
					class="choice"
					class:selected={selected === choice.value}
					{disabled}
					onclick={() => onanswer(choice.value)}
				>
					{choice.value}
				</button>
			{/each}
		</div>
	{:else}
		<form onsubmit={submit} class="answer">
			<label class="visually-hidden" for="answer">Your answer</label>
			<input
				id="answer"
				bind:value={text}
				{disabled}
				autocomplete="off"
				autocapitalize="characters"
				spellcheck="false"
				inputmode={question.type === 'numeric' ? 'numeric' : 'text'}
				placeholder={question.type === 'numeric' ? 'Type a number' : 'Type your answer'}
			/>
			<Button type="submit" disabled={disabled || !text.trim()}>Check my answer</Button>
		</form>
		{#if question.keypad}
			<RomanKeypad vinculum={question.keypad === 'roman-vinculum'} {disabled} onkey={key} />
		{/if}
	{/if}
</section>

<style>
	.question {
		display: grid;
		gap: var(--space-4);
	}

	.prompt-row {
		display: flex;
		gap: var(--space-3);
		align-items: flex-start;
	}

	.prompt {
		flex: 1;
		font-size: var(--text-xl);
	}

	.scaffold {
		background: var(--surface-soft);
		border-radius: var(--radius-md);
		padding: var(--space-3) var(--space-4);
		font-variant-numeric: tabular-nums;
	}

	.scaffold p {
		margin: 0;
	}

	.blank {
		display: inline-block;
		min-width: 3ch;
		border-bottom: 2px dashed var(--ink-soft);
		text-align: center;
	}

	.choices {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
		gap: var(--space-3);
	}

	.choice {
		min-height: calc(var(--tap-min) * 1.3);
		border-radius: var(--radius-md);
		border: 2px solid var(--line);
		background: var(--surface);
		font-size: var(--text-xl);
		font-weight: 600;
		cursor: pointer;
	}

	.choice.selected {
		border-color: var(--subject, var(--ink));
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--subject, var(--ink)) 25%, transparent);
	}

	.answer {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
	}

	input {
		flex: 1;
		min-width: 10rem;
		min-height: var(--tap-min);
		border: 2px solid var(--line);
		border-radius: var(--radius-md);
		padding: var(--space-2) var(--space-4);
		font-size: var(--text-xl);
		letter-spacing: 0.05em;
	}
</style>
