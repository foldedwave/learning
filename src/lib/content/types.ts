import type { Rng } from './rng.ts';

export type Subject = 'maths' | 'english' | 'science';
export type Difficulty = 1 | 2 | 3;

export interface Skill {
	/** Dotted, lowercase and never reused, e.g. 'maths.number.roman.read-to-100'. */
	id: string;
	/** Child-facing. */
	title: string;
	/** Ladder stage, matching the usual year group. Never shown to the child. */
	stage: number;
	prerequisites: string[];
	/** Typical time per question when fluent. */
	targetSeconds: number;
	oak?: { unitSlug: string; lessonSlugs: string[] };
}

export interface ScaffoldStep {
	text: string;
	/** When set, the step is shown with this part left for the child to fill in. */
	blank?: string;
}

export type QuestionType = 'numeric' | 'choice' | 'text' | 'order' | 'drag-match' | 'model';

export interface Question {
	/** `${generatorId}:${seed}:${difficulty}` for generated questions. */
	itemId: string;
	skillId: string;
	type: QuestionType;
	/** Markdown (bold, italics, lists). */
	prompt: string;
	speak?: string;
	choices?: { value: string; misconceptionId?: string }[];
	/** Which on-screen keypad a text answer needs. */
	keypad?: 'roman' | 'roman-vinculum';
	hints: string[];
	scaffold?: ScaffoldStep[];
	/** Shown after answering. */
	explanation: string;
	/** A correct response, shown after answering and used by the generator tests. Never sent before answering. */
	answer: string;
	/** Pure; runs on the server for recorded attempts. */
	mark(response: unknown): Mark;
}

export interface Mark {
	correct: boolean;
	misconceptionId?: string;
}

/** A question as sent to the browser before it is answered. */
export type QuestionView = Omit<Question, 'mark' | 'answer' | 'explanation'>;

export interface QuestionGenerator {
	id: string;
	skillId: string;
	generate(rng: Rng, difficulty: Difficulty): Omit<Question, 'itemId' | 'skillId'>;
}

export type LearnCard =
	| { kind: 'explain'; title: string; body: string; speak?: string }
	| { kind: 'model'; title: string; model: string; props?: Record<string, unknown>; prompt: string }
	| { kind: 'worked-example'; title: string; steps: { text: string; highlight?: string }[] }
	| { kind: 'check-in'; title: string; generatorId: string; difficulty: Difficulty }
	| { kind: 'oak-video'; lessonSlug: string };

export interface Misconception {
	id: string;
	skillId: string;
	/** Parent-facing, e.g. 'Adds every symbol, so reads IV as 6'. */
	description: string;
	/** Child-facing, shown on a matching wrong answer. */
	feedback: string;
	/** Pre-written "show me another way" cards. */
	reteach: LearnCard[];
}

export interface StretchTask {
	id: string;
	skillId: string;
	title: string;
	/** Markdown. */
	prompt: string;
	/** Optional exact answer; open tasks are self-checked against the model answer. */
	answer?: string;
	modelAnswer: string;
}

export interface ExternalResource {
	url: string;
	title: string;
	source: string;
	kind: 'video' | 'article' | 'game' | 'problem';
	skillIds: string[];
}

export interface TopicDefinition {
	/** e.g. 'maths.number.roman' */
	id: string;
	/** URL segment, e.g. 'roman-numerals' */
	slug: string;
	subject: Subject;
	/** Strand slug, e.g. 'number' */
	strand: string;
	title: string;
	icon: string;
	/** One-line child-facing summary for topic cards. */
	summary: string;
	skills: Skill[];
	learn: LearnCard[];
	/** Fallback "another way" cards when no misconception matches. */
	alternative: LearnCard[];
	generators: QuestionGenerator[];
	misconceptions: Misconception[];
	stretch: StretchTask[];
	resources: ExternalResource[];
}

export interface StrandDefinition {
	subject: Subject;
	slug: string;
	title: string;
	icon: string;
	/** Topic ids in ladder order. */
	topics: string[];
}
