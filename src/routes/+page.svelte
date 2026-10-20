<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '#lib/components/ui/Button.svelte';
	import PinPad from '#lib/components/ui/PinPad.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	/** Which profile is asking for a PIN: a child id, 'parent', or null. */
	let picking = $state<number | 'parent' | null>(null);
	let pinForm = $state<HTMLFormElement>();

	const pickingChild = $derived(data.children.find((c) => c.id === picking));
</script>

<svelte:head><title>Who's learning? · Home Learning</title></svelte:head>

<main>
	{#if picking === null}
		<h1>Who's learning today?</h1>
		<div class="profiles">
			{#each data.children as kid (kid.id)}
				{#if kid.hasPin}
					<button type="button" class="profile" onclick={() => (picking = kid.id)}>
						<span class="avatar" aria-hidden="true">{kid.avatar}</span>
						<span class="name">{kid.displayName}</span>
					</button>
				{:else}
					<form method="POST" action="?/child" use:enhance>
						<input type="hidden" name="childId" value={kid.id} />
						<button class="profile">
							<span class="avatar" aria-hidden="true">{kid.avatar}</span>
							<span class="name">{kid.displayName}</span>
						</button>
					</form>
				{/if}
			{/each}
		</div>
		{#if form?.message}<p class="error" role="alert">{form.message}</p>{/if}
		<div class="parent-link">
			{#if data.parent}
				<Button variant="secondary" href="/parent">Parent area</Button>
			{:else}
				<Button variant="quiet" onclick={() => (picking = 'parent')}>🔐 Parent</Button>
			{/if}
		</div>
	{:else}
		<form
			method="POST"
			action={picking === 'parent' ? '?/parent' : '?/child'}
			use:enhance
			bind:this={pinForm}
			class="pin"
		>
			{#if picking === 'parent'}
				<h1>Parent PIN</h1>
				<PinPad kind="digit" />
				<Button type="submit">Unlock</Button>
			{:else if pickingChild}
				<h1>
					<span aria-hidden="true">{pickingChild.avatar}</span> Hi {pickingChild.displayName}!
				</h1>
				<p>Tap your three secret pictures.</p>
				<input type="hidden" name="childId" value={pickingChild.id} />
				<PinPad
					kind="picture"
					pictures={data.pictures}
					onfull={() => setTimeout(() => pinForm?.requestSubmit(), 150)}
				/>
			{/if}
			{#if form?.message}<p class="error" role="alert">{form.message}</p>{/if}
			<Button variant="quiet" onclick={() => (picking = null)}>← Back</Button>
		</form>
	{/if}
</main>

<style>
	main {
		max-width: 48rem;
		margin: 0 auto;
		padding: var(--space-12) var(--space-4);
		text-align: center;
	}

	.profiles {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--space-6);
		margin-block: var(--space-8);
	}

	.profile {
		display: grid;
		justify-items: center;
		gap: var(--space-2);
		width: 11rem;
		padding: var(--space-6) var(--space-4);
		border-radius: var(--radius-lg);
		border: 3px solid var(--line);
		background: var(--surface);
		box-shadow: var(--shadow-card);
		cursor: pointer;
	}

	.profile:hover {
		border-color: var(--ink-soft);
	}

	.avatar {
		font-size: 4rem;
		line-height: 1;
	}

	.name {
		font-size: var(--text-lg);
		font-weight: 600;
	}

	.pin {
		display: grid;
		justify-items: center;
		gap: var(--space-4);
	}

	.error {
		color: var(--nudge);
		font-weight: 600;
	}

	.parent-link {
		margin-top: var(--space-8);
	}
</style>
