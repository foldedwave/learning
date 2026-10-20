import { getTopic } from '#lib/content/index.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { topicId } = await parent();
	const topic = getTopic(topicId)!;
	return {
		tasks: topic.stretch.map(({ id, title, prompt, answer }) => ({
			id,
			title,
			prompt,
			open: answer === undefined
		})),
		resources: topic.resources
	};
};
