<script lang="ts">
	import { plainText } from './markdown.ts';

	let { text, label = 'Read aloud' }: { text: string; label?: string } = $props();

	let speaking = $state(false);
	const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

	function toggle() {
		const synth = window.speechSynthesis;
		if (speaking) {
			synth.cancel();
			speaking = false;
			return;
		}
		synth.cancel();
		const utterance = new SpeechSynthesisUtterance(plainText(text));
		utterance.lang = 'en-GB';
		utterance.rate = 0.95;
		utterance.onend = utterance.onerror = () => (speaking = false);
		speaking = true;
		synth.speak(utterance);
	}
</script>

{#if supported}
	<button type="button" class="speak" aria-pressed={speaking} onclick={toggle}>
		<span aria-hidden="true">{speaking ? '⏹️' : '🔊'}</span>
		<span class="visually-hidden">{speaking ? 'Stop reading' : label}</span>
	</button>
{/if}

<style>
	.speak {
		min-width: var(--tap-min);
		min-height: var(--tap-min);
		border-radius: 50%;
		border: 2px solid var(--line);
		background: var(--surface);
		font-size: var(--text-lg);
		cursor: pointer;
		flex-shrink: 0;
	}
</style>
