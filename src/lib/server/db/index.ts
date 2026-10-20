import { DATABASE_PATH } from '$app/env/private';
import { createDb } from './client';

export * as schema from './schema';
export type { Db } from './client';

/** The app's database, opened and migrated on first import. */
export const db = createDb(DATABASE_PATH);
