import { atLeast, isReviewDue, type MasteryState } from './mastery.ts';

interface SkillLike {
	id: string;
	prerequisites: string[];
}

/** A skill is unlocked when every prerequisite is Secure or better. */
export function isUnlocked(skill: SkillLike, mastery: (id: string) => MasteryState): boolean {
	return skill.prerequisites.every((id) => atLeast(mastery(id).level, 'secure'));
}

/**
 * The skill a topic's Practise and Check tabs should work on next:
 * a skill due for review first, then the first unlocked skill below Secure, then the last skill.
 */
export function focusSkill<S extends SkillLike>(
	skills: S[],
	mastery: (id: string) => MasteryState,
	now: string
): { skill: S; review: boolean } {
	const due = skills.find((s) => isReviewDue(mastery(s.id), now));
	if (due) return { skill: due, review: true };
	const next = skills.find(
		(s) => isUnlocked(s, mastery) && !atLeast(mastery(s.id).level, 'secure')
	);
	return { skill: next ?? skills[skills.length - 1], review: false };
}
