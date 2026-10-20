import { BAR, formatNumber, getPlaceValueBreakdown } from '#lib/content/maths/number/roman-numerals/convert.ts';
import { getDiagnosticMessage } from './diagnostics';
import { createQuestion, generateChoices } from './questions';
import { playSound } from './audio';
import type { Progress } from './progress.svelte';
import type { Concept, Feedback, Question } from './types';

/** Runs the current challenge: question, answer checking and feedback. */
export class Game {
	question = $state.raw<Question>();
	choices = $state.raw<string[]>([]);
	selected = $state<string | null>(null);
	keypadInput = $state('');
	feedback = $state.raw<Feedback | null>(null);
	/** Increments on every star award; the confetti component watches it. */
	celebrations = $state(0);

	#progress: Progress;
	#lastValues: Record<number, number> = {};

	concept: Concept;

	constructor(curriculum: Concept[], progress: Progress) {
		this.#progress = progress;
		this.concept = $derived(
			curriculum.find((c) => c.id === progress.currentLevelId) ?? curriculum[0]
		);
	}

	answered = $derived(this.feedback?.kind === 'success' || this.feedback?.kind === 'error');

	/** The keypad shows digit keys only when the prompt is a Roman numeral. */
	showDigits = $derived(this.question?.direction === 'toDecimal');

	selectLevel(id: number) {
		this.#progress.setLevel(id);
		this.nextQuestion();
	}

	nextQuestion() {
		const concept = this.concept;
		this.keypadInput = '';
		this.selected = null;
		this.feedback = null;

		const question = createQuestion(concept.id, this.#lastValues[concept.id]);
		this.#lastValues[concept.id] = question.value;
		this.question = question;
		this.choices = generateChoices(question);
	}

	pressKey(value: string) {
		if (this.answered) return;
		this.keypadInput += value;
	}

	backspace() {
		if (this.answered || !this.keypadInput) return;
		// Vinculum keys are two code units: letter + combining bar
		const n = this.keypadInput.endsWith(BAR) ? 2 : 1;
		this.keypadInput = this.keypadInput.slice(0, -n);
	}

	chooseAnswer(choice: string) {
		if (this.answered || !this.question) return;
		this.selected = choice;
		this.#grade(choice === this.question.correctTarget, choice);
	}

	submitKeypad() {
		if (this.answered || !this.question || !this.keypadInput.trim()) return;
		const clean = (s: string) => s.replace(/,/g, '').trim().toUpperCase();
		this.#grade(clean(this.keypadInput) === clean(this.question.correctTarget), this.keypadInput);
	}

	showHint() {
		if (this.answered || !this.question) return;
		this.feedback = {
			kind: 'hint',
			icon: '💡',
			title: 'Place-Value Breakdown Hint',
			messageHtml: `Break <strong>${formatNumber(this.question.value)}</strong> into place-value columns and translate each column separately:`,
			breakdown: getPlaceValueBreakdown(this.question.value)
		};
	}

	#grade(correct: boolean, attempt: string) {
		const q = this.question!;
		const breakdown = getPlaceValueBreakdown(q.value);

		if (correct) {
			const earnedStar = this.#progress.recordCorrect();
			if (earnedStar) {
				this.#sound('star');
				this.celebrations++;
			} else {
				this.#sound('correct');
			}
			this.feedback = {
				kind: 'success',
				icon: '🎉',
				title: 'Glorious Victory!',
				messageHtml: earnedStar
					? `<strong>★ YOU EARNED A GOLD STAR! ★</strong> You've mastered 5 in a row for this concept! Your counter resets to 0/5 so you can earn even more stars!`
					: `Excellent! ${formatNumber(q.value)} is written as ${q.roman}. Notice how each place-value chunk builds the total!`,
				breakdown
			};
		} else {
			this.#progress.recordIncorrect();
			this.#sound('wrong');
			this.feedback = {
				kind: 'error',
				icon: '🦉',
				title: "Titus's Diagnostic Hint",
				messageHtml: getDiagnosticMessage(attempt, q, this.concept),
				breakdown
			};
		}
	}

	#sound(type: Parameters<typeof playSound>[0]) {
		if (this.#progress.soundEnabled) playSound(type);
	}
}
