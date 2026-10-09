import type { Concept, Question } from './types';

/** Concept-aware feedback for a wrong answer. Returns trusted HTML. */
export function getDiagnosticMessage(
	attempt: string,
	question: Question,
	concept: Concept
): string {
	const upper = attempt.toUpperCase();

	// Classic place-value mistakes
	if (question.value === 49 && upper === 'IL') {
		return `<strong>Classic Trap!</strong> In standard Roman arithmetic, you cannot subtract 1 (I) from 50 (L) directly. You must chunk tens and ones: 40 is <strong>XL</strong> and 9 is <strong>IX</strong>, making <strong>XLIX</strong>!`;
	}
	if (question.value === 99 && upper === 'IC') {
		return `<strong>Trap Alert!</strong> 99 is not IC! Break it into columns: 90 is <strong>XC</strong> and 9 is <strong>IX</strong>. Put them together for <strong>XCIX</strong>!`;
	}

	// Rule of Three violation
	if (upper.includes('IIII') || upper.includes('XXXX') || upper.includes('CCCC')) {
		return `<strong>Rule of Three Broken:</strong> You cannot write four identical letters in a row. Use subtraction instead (for example, 4 is IV, 40 is XL)!`;
	}

	return `Not quite! The correct answer is <strong>${question.correctTarget}</strong>.<br>
		<strong>Concept rule applied:</strong> ${concept.tip}<br>
		Look at the breakdown blocks below to see how each column was built!`;
}
