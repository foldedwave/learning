import { asc, eq, isNull } from 'drizzle-orm';
import type { Conn } from './db/client.ts';
import { child, parent } from './db/schema.ts';
import { hashPin } from './auth.ts';

export const AVATARS = ['🦉', '🐉', '🦄', '🐬', '🚀', '🦖', '🐝', '🌟'] as const;

export interface NewChild {
	displayName: string;
	avatar: string;
	yearGroup: number;
	/** Picture PIN as '0-4-7', or null for none. */
	picturePin: string | null;
	interests?: string[];
	readingAge?: number | null;
}

export async function createChild(db: Conn, input: NewChild): Promise<number> {
	const row = db
		.insert(child)
		.values({
			displayName: input.displayName.trim(),
			avatar: input.avatar,
			yearGroup: input.yearGroup,
			pinHash: input.picturePin ? await hashPin(input.picturePin) : null,
			interests: input.interests ?? [],
			readingAge: input.readingAge ?? null
		})
		.returning({ id: child.id })
		.get();
	return row.id;
}

export async function createParent(db: Conn, pin: string) {
	db.insert(parent)
		.values({ id: 1, pinHash: await hashPin(pin) })
		.run();
}

/** Active children for the profile picker. Only display fields leave the server. */
export function listChildren(db: Conn) {
	return db
		.select({
			id: child.id,
			displayName: child.displayName,
			avatar: child.avatar,
			hasPin: child.pinHash
		})
		.from(child)
		.where(isNull(child.archivedAt))
		.orderBy(asc(child.id))
		.all()
		.map((c) => ({ ...c, hasPin: c.hasPin !== null }));
}

export function getChild(db: Conn, id: number) {
	return db.select().from(child).where(eq(child.id, id)).get();
}
