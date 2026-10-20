<script lang="ts">
	import { getQuest } from '../roman/context';
	import { ANSWERS_PER_STAR } from '../roman/progress.svelte';
	import ChoiceGrid from './ChoiceGrid.svelte';
	import Keypad from './Keypad.svelte';
	import FeedbackBanner from './FeedbackBanner.svelte';

	const { progress, game } = getQuest();

	// Only rendered once a question exists (see Quest.svelte)
	const question = $derived(game.question!);
	const level = $derived(progress.current);
</script>

<section>
	<div class="status-bar">
		<div class="progress-tracker">
			<div class="progress-labels">
				<span>{level.progress} / {ANSWERS_PER_STAR} to next star</span>
				<span>Streak: {level.streak} 🔥</span>
			</div>
			<div class="bar-bg">
				<div class="bar-fill" style:width="{(level.progress / ANSWERS_PER_STAR) * 100}%"></div>
			</div>
		</div>
		<div class="star-chip">★ {level.stars} Stars</div>
	</div>

	<div class="mode-toggle" role="group" aria-label="Answer mode">
		<button
			type="button"
			class:active={progress.mode === 'mc'}
			aria-pressed={progress.mode === 'mc'}
			onclick={() => progress.setMode('mc')}
		>
			Multiple Choice
		</button>
		<button
			type="button"
			class:active={progress.mode === 'keypad'}
			aria-pressed={progress.mode === 'keypad'}
			onclick={() => progress.setMode('keypad')}
		>
			Roman Keypad
		</button>
	</div>

	<div class="prompt-box">
		<div class="prompt-label">
			{question.direction === 'toRoman'
				? 'Convert this Number into Roman Numerals:'
				: 'What is the Number value of this Roman Numeral?'}
		</div>
		<div class="prompt-val">{question.promptText}</div>
	</div>

	{#if progress.mode === 'mc'}
		<ChoiceGrid
			choices={game.choices}
			correct={question.correctTarget}
			selected={game.selected}
			answered={game.answered}
			onpick={(choice) => game.chooseAnswer(choice)}
		/>
	{:else}
		<Keypad
			input={game.keypadInput}
			showVinculum={!!game.concept.hasVinculum}
			showDigits={game.showDigits}
			disabled={game.answered}
			onpress={(v) => game.pressKey(v)}
			onbackspace={() => game.backspace()}
			onsubmit={() => game.submitKeypad()}
		/>
	{/if}

	{#if game.feedback}
		<FeedbackBanner feedback={game.feedback} />
	{/if}

	<div class="controls">
		<button
			type="button"
			class="secondary"
			disabled={game.answered}
			onclick={() => game.showHint()}
		>
			<span>💡</span> Need a Concept Hint?
		</button>
		{#if game.answered}
			<button type="button" class="next" onclick={() => game.nextQuestion()}>
				Next Challenge ➔
			</button>
		{/if}
	</div>
</section>

<style>
	section {
		background: var(--card-bg);
		border-radius: var(--radius);
		padding: 24px;
		border: 2px solid var(--stone-border);
		box-shadow: var(--shadow);
		display: flex;
		flex-direction: column;
		gap: 20px;
		min-width: 0;
	}

	.status-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;
	}

	.progress-tracker {
		flex: 1;
		min-width: 180px;
	}

	.progress-labels {
		display: flex;
		justify-content: space-between;
		font-size: 0.8rem;
		font-weight: 700;
		margin-bottom: 5px;
		color: #615651;
	}

	.bar-bg {
		background: var(--stone-gray);
		height: 12px;
		border-radius: 10px;
		overflow: hidden;
	}

	.bar-fill {
		background: linear-gradient(90deg, var(--laurel-gold), #ffbf00);
		height: 100%;
		transition: width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.star-chip {
		background: #fff8e1;
		color: #9c6c00;
		border: 1px solid #ffd54f;
		padding: 6px 12px;
		border-radius: 10px;
		font-size: 0.85rem;
		font-weight: 800;
	}

	.mode-toggle {
		display: flex;
		justify-content: center;
		gap: 6px;
		background: var(--stone-gray);
		padding: 4px;
		border-radius: 12px;
		width: fit-content;
		margin: 0 auto;
	}

	.mode-toggle button {
		background: transparent;
		border: none;
		padding: 6px 14px;
		font-size: 0.82rem;
		font-weight: 700;
		border-radius: 9px;
		cursor: pointer;
		color: #5d524d;
		transition: all 0.2s;
	}

	.mode-toggle button.active {
		background: white;
		color: var(--imperial-purple);
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
	}

	.prompt-box {
		background: linear-gradient(180deg, #fefefe 0%, #fbf9f4 100%);
		border: 2px dashed #ded4c3;
		border-radius: 16px;
		padding: 28px 20px;
		text-align: center;
	}

	.prompt-label {
		font-size: 0.95rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.8px;
		color: #796c64;
		margin-bottom: 8px;
	}

	.prompt-val {
		font-size: 3rem;
		font-weight: 900;
		color: var(--terracotta);
		letter-spacing: 2px;
		line-height: 1.1;
		overflow-wrap: anywhere;
	}

	.controls {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 10px;
	}

	.secondary {
		background: transparent;
		border: 1px solid var(--stone-border);
		color: #554a45;
		padding: 8px 14px;
		border-radius: 10px;
		font-weight: 700;
		font-size: 0.85rem;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		transition: all 0.2s;
	}

	.secondary:hover:not(:disabled) {
		background: var(--stone-gray);
		color: var(--charcoal);
	}

	.secondary:disabled {
		opacity: 0.5;
		cursor: default;
	}

	.next {
		background: var(--imperial-purple);
		color: white;
		border: none;
		padding: 10px 22px;
		border-radius: 12px;
		font-weight: 800;
		font-size: 1rem;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		transition: all 0.2s;
		box-shadow: 0 4px 12px rgba(74, 37, 69, 0.2);
		margin-left: auto;
	}

	.next:hover {
		background: var(--imperial-purple-light);
		transform: translateY(-1px);
	}

	@media (max-width: 600px) {
		.prompt-val {
			font-size: 2.3rem;
		}
	}
</style>
