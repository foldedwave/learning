<script lang="ts">
	import { onMount } from 'svelte';

	let { message, ondone }: { message: string; ondone: () => void } = $props();

	onMount(() => {
		const ms =
			parseFloat(
				getComputedStyle(document.documentElement).getPropertyValue('--motion-celebrate')
			) || 0;
		// --motion-celebrate is 0 under reduced motion, which skips the celebration entirely
		const timer = setTimeout(ondone, ms);
		return () => clearTimeout(timer);
	});
</script>

<button type="button" class="celebration" onclick={ondone} aria-live="assertive">
	<span class="burst" aria-hidden="true">🎉</span>
	<span class="message">{message}</span>
	<span class="skip">Tap to carry on</span>
</button>

<style>
	.celebration {
		position: fixed;
		inset: 0;
		z-index: 10;
		display: grid;
		place-content: center;
		justify-items: center;
		gap: var(--space-3);
		background: color-mix(in srgb, var(--surface) 92%, transparent);
		border: 0;
		cursor: pointer;
		animation: pop var(--motion-celebrate) ease-out;
	}

	.burst {
		font-size: 5rem;
	}

	.message {
		font-size: var(--text-xl);
		font-weight: 600;
	}

	.skip {
		color: var(--ink-soft);
	}

	@keyframes pop {
		from {
			transform: scale(0.9);
			opacity: 0;
		}
		30% {
			transform: scale(1.03);
			opacity: 1;
		}
		to {
			transform: scale(1);
		}
	}
</style>
