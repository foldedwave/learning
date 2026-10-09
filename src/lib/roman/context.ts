import { getContext, setContext } from 'svelte';
import type { Game } from './game.svelte';
import type { Progress } from './progress.svelte';

const KEY = Symbol('roman-quest');

interface QuestContext {
	progress: Progress;
	game: Game;
}

export const setQuest = (ctx: QuestContext) => setContext(KEY, ctx);
export const getQuest = () => getContext<QuestContext>(KEY);
