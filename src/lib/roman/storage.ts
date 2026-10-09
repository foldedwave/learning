import type { SavedState } from './types';

/**
 * Where progress lives. Everything is async so a future account-backed
 * implementation (remote functions + DB) can replace the browser one
 * without touching callers.
 */
export interface ProgressRepository {
	load(): Promise<SavedState | null>;
	save(state: SavedState): Promise<void>;
	clear(): Promise<void>;
}

// Unchanged from the original single-file app so existing progress carries over.
const STORAGE_KEY = 'roman_quest_v2_data';

export const localStorageRepository: ProgressRepository = {
	async load() {
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			return saved ? (JSON.parse(saved) as SavedState) : null;
		} catch (e) {
			console.warn('Storage load error', e);
			return null;
		}
	},
	async save(state) {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
		} catch (e) {
			console.warn('Storage save error', e);
		}
	},
	async clear() {
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch (e) {
			console.warn('Storage clear error', e);
		}
	}
};
