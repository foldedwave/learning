import { query } from '$app/server';
import { CURRICULUM } from '#lib/legacy/curriculum.ts';

/** The full list of Roman Quest levels, including lesson content. */
export const getCurriculum = query(async () => CURRICULUM);
