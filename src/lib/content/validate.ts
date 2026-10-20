import { z } from 'zod';
import type { TopicDefinition } from './types.ts';

const id = z.string().regex(/^[a-z0-9-]+(\.[a-z0-9-]+)+$/, 'IDs are dotted, lowercase');

const learnCard = z.discriminatedUnion('kind', [
	z.object({
		kind: z.literal('explain'),
		title: z.string().min(1),
		body: z.string().min(1),
		speak: z.string().optional()
	}),
	z.object({
		kind: z.literal('model'),
		title: z.string().min(1),
		model: z.string().min(1),
		props: z.record(z.string(), z.unknown()).optional(),
		prompt: z.string().min(1)
	}),
	z.object({
		kind: z.literal('worked-example'),
		title: z.string().min(1),
		steps: z.array(z.object({ text: z.string().min(1), highlight: z.string().optional() })).min(2)
	}),
	z.object({
		kind: z.literal('check-in'),
		title: z.string().min(1),
		generatorId: z.string(),
		difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)])
	}),
	z.object({ kind: z.literal('oak-video'), lessonSlug: z.string().min(1) })
]);

export const topicSchema = z.object({
	id,
	slug: z.string().regex(/^[a-z0-9-]+$/),
	subject: z.enum(['maths', 'english', 'science']),
	strand: z.string().regex(/^[a-z0-9-]+$/),
	title: z.string().min(1),
	icon: z.string().min(1),
	summary: z.string().min(1),
	skills: z
		.array(
			z.object({
				id,
				title: z.string().min(1),
				stage: z.number().int().min(1).max(13),
				prerequisites: z.array(id),
				targetSeconds: z.number().positive(),
				oak: z.object({ unitSlug: z.string(), lessonSlugs: z.array(z.string()) }).optional()
			})
		)
		.min(1)
		.max(4),
	learn: z.array(learnCard).min(3),
	alternative: z.array(learnCard).min(1),
	generators: z.array(z.object({ id, skillId: id, generate: z.function() })).min(1),
	misconceptions: z.array(
		z.object({
			id,
			skillId: id,
			description: z.string().min(1),
			feedback: z.string().min(1),
			reteach: z.array(learnCard).min(1)
		})
	),
	stretch: z.array(
		z.object({
			id,
			skillId: id,
			title: z.string().min(1),
			prompt: z.string().min(1),
			answer: z.string().optional(),
			modelAnswer: z.string().min(1)
		})
	),
	resources: z.array(
		z.object({
			url: z.url(),
			title: z.string().min(1),
			source: z.string().min(1),
			kind: z.enum(['video', 'article', 'game', 'problem']),
			skillIds: z.array(id)
		})
	)
});

/**
 * Checks every topic parses and that the content hangs together: unique IDs,
 * prerequisites that exist without cycles, and references that resolve.
 * Returns a list of problems; empty means valid.
 */
export function validateContent(topics: TopicDefinition[]): string[] {
	const problems: string[] = [];
	const seen = new Set<string>();
	const unique = (kind: string, value: string) => {
		if (seen.has(value)) problems.push(`Duplicate ${kind} id: ${value}`);
		seen.add(value);
	};

	for (const topic of topics) {
		const parsed = topicSchema.safeParse(topic);
		if (!parsed.success) {
			for (const issue of parsed.error.issues) {
				problems.push(`${topic.id}: ${issue.path.join('.')}: ${issue.message}`);
			}
		}
		const ownCards = topic.learn.filter((c) => c.kind !== 'check-in' && c.kind !== 'oak-video');
		if (ownCards.length < 3 || ownCards.length > 6) {
			problems.push(`${topic.id}: needs 3–6 of its own Learn cards, has ${ownCards.length}`);
		}
		const firstOak = topic.learn.findIndex((c) => c.kind === 'oak-video');
		const lastOwn = topic.learn.findLastIndex(
			(c) => c.kind !== 'oak-video' && c.kind !== 'check-in'
		);
		if (firstOak !== -1 && firstOak < lastOwn) {
			problems.push(`${topic.id}: Oak videos must come after our own Learn cards`);
		}
		unique('topic', topic.id);
		topic.skills.forEach((s) => unique('skill', s.id));
		topic.generators.forEach((g) => unique('generator', g.id));
		topic.misconceptions.forEach((m) => unique('misconception', m.id));
		topic.stretch.forEach((s) => unique('stretch task', s.id));
	}

	const skills = new Map(topics.flatMap((t) => t.skills.map((s) => [s.id, s] as const)));
	const generators = new Set(topics.flatMap((t) => t.generators.map((g) => g.id)));

	for (const topic of topics) {
		const local = (what: string, skillId: string) => {
			if (!skills.has(skillId))
				problems.push(`${topic.id}: ${what} refers to unknown skill ${skillId}`);
		};
		topic.generators.forEach((g) => local(`generator ${g.id}`, g.skillId));
		topic.misconceptions.forEach((m) => local(`misconception ${m.id}`, m.skillId));
		topic.stretch.forEach((s) => local(`stretch task ${s.id}`, s.skillId));
		topic.resources.forEach((r) => r.skillIds.forEach((s) => local(`resource ${r.url}`, s)));
		for (const card of [...topic.learn, ...topic.alternative]) {
			if (card.kind === 'check-in' && !generators.has(card.generatorId)) {
				problems.push(`${topic.id}: check-in refers to unknown generator ${card.generatorId}`);
			}
		}
		for (const skill of topic.skills) {
			if (!topic.generators.some((g) => g.skillId === skill.id)) {
				problems.push(`${topic.id}: skill ${skill.id} has no question generator`);
			}
		}
	}

	for (const skill of skills.values()) {
		for (const pre of skill.prerequisites) {
			if (!skills.has(pre)) problems.push(`Skill ${skill.id} has unknown prerequisite ${pre}`);
		}
	}

	// Cycle check: depth-first search over the prerequisite graph
	const state = new Map<string, 'visiting' | 'done'>();
	const visit = (skillId: string, path: string[]) => {
		if (state.get(skillId) === 'done') return;
		if (state.get(skillId) === 'visiting') {
			problems.push(`Prerequisite cycle: ${[...path, skillId].join(' → ')}`);
			return;
		}
		state.set(skillId, 'visiting');
		for (const pre of skills.get(skillId)?.prerequisites ?? []) visit(pre, [...path, skillId]);
		state.set(skillId, 'done');
	};
	for (const skillId of skills.keys()) visit(skillId, []);

	return problems;
}
