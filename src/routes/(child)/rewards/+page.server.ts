import { desc, eq } from 'drizzle-orm';
import { db, schema } from '#lib/server/db/index.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (!locals.child) return { recent: [] };
	return {
		recent: db
			.select({
				id: schema.rewardEvent.id,
				stars: schema.rewardEvent.stars,
				reason: schema.rewardEvent.reason,
				createdAt: schema.rewardEvent.createdAt
			})
			.from(schema.rewardEvent)
			.where(eq(schema.rewardEvent.childId, locals.child.id))
			.orderBy(desc(schema.rewardEvent.id))
			.limit(20)
			.all()
	};
};
