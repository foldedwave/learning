<script lang="ts">
	import { onMount } from 'svelte';
	import { Game } from '../roman/game.svelte';
	import { Progress } from '../roman/progress.svelte';
	import { setQuest } from '../roman/context';
	import type { Concept } from '../roman/types';
	import SiteHeader from './SiteHeader.svelte';
	import LevelSelector from './LevelSelector.svelte';
	import ConceptCard from './ConceptCard.svelte';
	import ChallengePanel from './ChallengePanel.svelte';
	import Converter from './Converter.svelte';
	import Confetti from './Confetti.svelte';

	let { curriculum }: { curriculum: Concept[] } = $props();

	// The curriculum is fixed for the page's lifetime, so capturing it once is intended.
	// svelte-ignore state_referenced_locally
	const progress = new Progress(curriculum.map((c) => c.id));
	// svelte-ignore state_referenced_locally
	const game = new Game(curriculum, progress);
	setQuest({ progress, game });

	let ready = $state(false);

	onMount(async () => {
		await progress.load();
		game.nextQuestion();
		ready = true;
	});
</script>

<Confetti trigger={game.celebrations} />
<SiteHeader />

<main>
	<LevelSelector {curriculum} />

	{#if ready}
		<div class="quest-grid">
			<ConceptCard concept={game.concept} />
			<ChallengePanel />
		</div>
	{/if}

	<Converter />
</main>

<style>
	main {
		max-width: 1100px;
		width: 100%;
		margin: 0 auto;
		padding: 20px 16px 40px;
	}

	.quest-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 20px;
	}

	@media (min-width: 880px) {
		.quest-grid {
			grid-template-columns: 340px 1fr;
		}
	}
</style>
