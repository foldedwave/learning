<script lang="ts">
	import { getQuest } from '../roman/context';
	import RulesModal from './RulesModal.svelte';

	const { progress, game } = getQuest();

	let rulesOpen = $state(false);
	let fullscreen = $state(false);

	function toggleFullscreen() {
		if (document.fullscreenElement) void document.exitFullscreen();
		else document.documentElement.requestFullscreen().catch(() => {});
	}

	async function reset() {
		if (!confirm('Reset all stars and progress? You can start the Roman adventure fresh!')) return;
		await progress.reset();
		game.selectLevel(1);
	}
</script>

<svelte:document onfullscreenchange={() => (fullscreen = !!document.fullscreenElement)} />

<header>
	<div class="content">
		<div class="logo-area">
			<div class="logo-icon">🏛️</div>
			<div>
				<h1>ROMAN QUEST</h1>
				<p>Concept-by-Concept Mastery for Young Explorers</p>
			</div>
		</div>
		<div class="actions">
			<button type="button" onclick={() => progress.toggleSound()}>
				{progress.soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
			</button>
			<button type="button" onclick={toggleFullscreen}>
				{fullscreen ? '🗗 Exit Fullscreen' : '⛶ Fullscreen'}
			</button>
			<button type="button" onclick={() => (rulesOpen = true)}>📜 The 4 Rules</button>
			<button type="button" onclick={reset}>🔄 Reset</button>
		</div>
	</div>
</header>

<RulesModal bind:open={rulesOpen} />

<style>
	header {
		background: linear-gradient(135deg, var(--imperial-purple), #2d142a);
		color: white;
		padding: 14px 20px;
		box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
		position: sticky;
		top: 0;
		z-index: 50;
	}

	.content {
		max-width: 1100px;
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 12px;
	}

	.logo-area {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.logo-icon {
		font-size: 2rem;
		background: rgba(255, 255, 255, 0.15);
		padding: 6px 12px;
		border-radius: 14px;
		border: 1px solid rgba(255, 215, 0, 0.3);
	}

	h1 {
		font-size: 1.35rem;
		font-weight: 800;
		letter-spacing: 0.5px;
	}

	.logo-area p {
		font-size: 0.8rem;
		color: var(--laurel-gold-light);
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}

	button {
		background: rgba(255, 255, 255, 0.12);
		border: 1px solid rgba(255, 255, 255, 0.25);
		color: white;
		padding: 7px 12px;
		border-radius: 10px;
		cursor: pointer;
		font-size: 0.85rem;
		font-weight: 600;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		transition: all 0.2s;
	}

	button:hover {
		background: rgba(255, 255, 255, 0.24);
		transform: translateY(-1px);
	}
</style>
