import { localStorageRepository, type ProgressRepository } from './storage';
import type { InputMode, LevelProgress, SavedState } from './types';

export const ANSWERS_PER_STAR = 5;

const emptyLevel = (): LevelProgress => ({ stars: 0, progress: 0, streak: 0 });

/** Reactive, persisted player progress. */
export class Progress {
	currentLevelId = $state(1);
	mode = $state<InputMode>('mc');
	soundEnabled = $state(true);
	levels = $state<Record<number, LevelProgress>>({});

	#levelIds: number[];
	#repo: ProgressRepository;

	constructor(levelIds: number[], repo: ProgressRepository = localStorageRepository) {
		this.#levelIds = levelIds;
		this.#repo = repo;
		this.#fillMissingLevels();
	}

	current = $derived(this.levels[this.currentLevelId] ?? emptyLevel());

	async load() {
		const saved = await this.#repo.load();
		if (saved) {
			this.currentLevelId = saved.currentLevelId ?? 1;
			this.mode = saved.mode ?? 'mc';
			this.soundEnabled = saved.soundEnabled ?? true;
			this.levels = saved.levels ?? {};
		}
		this.#fillMissingLevels();
		if (!this.#levelIds.includes(this.currentLevelId)) this.currentLevelId = this.#levelIds[0];
	}

	async reset() {
		await this.#repo.clear();
		this.currentLevelId = 1;
		this.levels = {};
		this.#fillMissingLevels();
	}

	setLevel(id: number) {
		this.currentLevelId = id;
		this.#save();
	}

	setMode(mode: InputMode) {
		this.mode = mode;
		this.#save();
	}

	toggleSound() {
		this.soundEnabled = !this.soundEnabled;
		this.#save();
	}

	/** Records a correct answer. Returns true if it earned a star. */
	recordCorrect(): boolean {
		const level = this.levels[this.currentLevelId];
		level.streak += 1;
		level.progress += 1;
		let awarded = false;
		if (level.progress >= ANSWERS_PER_STAR) {
			level.stars += 1;
			level.progress = 0;
			awarded = true;
		}
		this.#save();
		return awarded;
	}

	recordIncorrect() {
		this.levels[this.currentLevelId].streak = 0;
		this.#save();
	}

	#fillMissingLevels() {
		for (const id of this.#levelIds) this.levels[id] ??= emptyLevel();
	}

	#save() {
		const snapshot: SavedState = $state.snapshot({
			currentLevelId: this.currentLevelId,
			mode: this.mode,
			soundEnabled: this.soundEnabled,
			levels: this.levels
		});
		void this.#repo.save(snapshot);
	}
}
