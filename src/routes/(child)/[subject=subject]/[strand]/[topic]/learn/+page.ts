import { getTopic } from '#lib/content/index.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { topicId } = await parent();
	return { learn: getTopic(topicId)!.learn };
};
