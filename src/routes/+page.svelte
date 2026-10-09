<script lang="ts">
	import Quest from '#lib/components/Quest.svelte';
	import { getCurriculum } from './curriculum.remote';
</script>

<svelte:boundary>
	<Quest curriculum={await getCurriculum()} />

	{#snippet pending()}
		<p class="status">Unrolling the scrolls…</p>
	{/snippet}

	{#snippet failed(error, reset)}
		<div class="status">
			<p>The scrolls could not be loaded.</p>
			<p class="detail">{error instanceof Error ? error.message : ''}</p>
			<button onclick={reset}>Try again</button>
		</div>
	{/snippet}
</svelte:boundary>

<style>
	.status {
		padding: 40px 16px;
		text-align: center;
		color: var(--imperial-purple);
		font-weight: 700;
	}
	.detail {
		font-size: 0.85rem;
		font-weight: 400;
	}
</style>
