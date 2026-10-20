import { romanNumerals } from './maths/number/roman-numerals/topic.ts';
import { createRng } from './rng.ts';
import type {
	Difficulty,
	Question,
	QuestionGenerator,
	QuestionView,
	Skill,
	StrandDefinition,
	Subject,
	TopicDefinition
} from './types.ts';

export const SUBJECTS: { id: Subject; title: string; icon: string }[] = [
	{ id: 'maths', title: 'Maths', icon: '🔢' },
	{ id: 'english', title: 'English', icon: '📖' },
	{ id: 'science', title: 'Science', icon: '🔬' }
];

export const STRANDS: StrandDefinition[] = [
	{
		subject: 'maths',
		slug: 'number',
		title: 'Number & place value',
		icon: '🧮',
		topics: [romanNumerals.id]
	},
	{ subject: 'maths', slug: 'calculation', title: 'Calculation', icon: '➗', topics: [] },
	{
		subject: 'maths',
		slug: 'fractions',
		title: 'Fractions, decimals & percentages',
		icon: '🍕',
		topics: []
	}
];

export const TOPICS: TopicDefinition[] = [romanNumerals];

const topicsById = new Map(TOPICS.map((t) => [t.id, t]));
const skillsById = new Map<string, { skill: Skill; topic: TopicDefinition }>(
	TOPICS.flatMap((topic) => topic.skills.map((skill) => [skill.id, { skill, topic }] as const))
);
const generatorsById = new Map<string, QuestionGenerator>(
	TOPICS.flatMap((t) => t.generators.map((g) => [g.id, g] as const))
);

export const getTopic = (id: string) => topicsById.get(id);
export const getSkill = (id: string) => skillsById.get(id);
export const getGenerator = (id: string) => generatorsById.get(id);
export const subjectTitle = (id: Subject) => SUBJECTS.find((s) => s.id === id)!.title;

export const strandsFor = (subject: Subject) => STRANDS.filter((s) => s.subject === subject);

export function getStrand(subject: string, slug: string) {
	return STRANDS.find((s) => s.subject === subject && s.slug === slug);
}

export function getTopicBySlug(subject: string, strand: string, slug: string) {
	return TOPICS.find((t) => t.subject === subject && t.strand === strand && t.slug === slug);
}

export function topicPath(topic: TopicDefinition) {
	return `/${topic.subject}/${topic.strand}/${topic.slug}`;
}

/** Builds a question exactly; the same generator, seed and difficulty always give the same question. */
export function makeQuestion(
	generator: QuestionGenerator,
	seed: number,
	difficulty: Difficulty
): Question {
	const q = generator.generate(createRng(seed), difficulty);
	return { ...q, itemId: `${generator.id}:${seed}:${difficulty}`, skillId: generator.skillId };
}

/** Regenerates a question from its stored item id, or undefined if the id is unknown or malformed. */
export function questionFromItemId(itemId: string): Question | undefined {
	const match = /^(.+):(\d+):([123])$/.exec(itemId);
	if (!match) return undefined;
	const generator = getGenerator(match[1]);
	if (!generator) return undefined;
	return makeQuestion(generator, Number(match[2]), Number(match[3]) as Difficulty);
}

/** Strips the marking function and answer so the question can be sent to the browser. */
export function toView(question: Question): QuestionView {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { mark, answer, explanation, ...view } = question;
	// The blank in the last scaffold step is part of the answer, so only its position is sent
	const scaffold = view.scaffold?.map((step) => (step.blank ? { ...step, blank: '?' } : step));
	return { ...view, scaffold };
}
