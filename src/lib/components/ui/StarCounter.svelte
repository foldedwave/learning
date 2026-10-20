<script lang="ts">
	let { stars }: { stars: number } = $props();
</script>

<span class="stars" aria-label="{stars} stars">
	<span aria-hidden="true">⭐</span>
	<span class="count" aria-hidden="true">{stars}</span>
</span>

<style>
	.stars {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		font-weight: 600;
		color: var(--star);
		background: var(--surface);
		border: 2px solid var(--line);
		border-radius: var(--radius-lg);
		padding: var(--space-1) var(--space-3);
		min-height: var(--tap-min);
	}

	.count {
		font-variant-numeric: tabular-nums;
	}
</style>
