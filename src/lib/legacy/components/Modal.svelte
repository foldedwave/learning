<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		open = $bindable(false),
		label,
		children
	}: { open?: boolean; label: string; children: Snippet } = $props();

	let dialog: HTMLDialogElement;

	$effect(() => {
		if (open && !dialog.open) dialog.showModal();
		else if (!open && dialog.open) dialog.close();
	});
</script>

<!-- Escape closes natively; the click handler only adds backdrop-click dismissal -->
<dialog
	bind:this={dialog}
	aria-label={label}
	onclose={() => (open = false)}
	onclick={(e) => {
		if (e.target === dialog) open = false;
	}}
>
	<div class="card">
		<button class="close" type="button" aria-label="Close" onclick={() => (open = false)}>
			&times;
		</button>
		{@render children()}
	</div>
</dialog>

<style>
	dialog {
		margin: auto;
		padding: 0;
		border: none;
		background: transparent;
		max-width: 650px;
		width: calc(100% - 32px);
		max-height: 90vh;
		overflow: visible;
	}

	dialog::backdrop {
		background: rgba(44, 37, 35, 0.65);
		backdrop-filter: blur(4px);
	}

	.card {
		background: white;
		border-radius: 20px;
		max-height: 90vh;
		overflow-y: auto;
		padding: 26px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
		position: relative;
		animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.close {
		position: absolute;
		top: 18px;
		right: 18px;
		background: var(--stone-gray);
		border: none;
		width: 34px;
		height: 34px;
		border-radius: 50%;
		font-size: 1.1rem;
		font-weight: 800;
		cursor: pointer;
		color: var(--charcoal);
	}
</style>
