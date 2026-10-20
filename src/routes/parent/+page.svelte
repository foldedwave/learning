<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '#lib/components/ui/Button.svelte';
	import PinPad from '#lib/components/ui/PinPad.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let adding = $state(false);
</script>

<svelte:head><title>Parent area · Home Learning</title></svelte:head>

<header class="bar">
	<h1>Parent area</h1>
	<Button variant="secondary" href="/today">Preview the child pages</Button>
	<form method="POST" action="/signout">
		<Button type="submit" variant="quiet">Sign out</Button>
	</form>
</header>

<main>
	<p class="lead">
		The full dashboard, plan builder and reports arrive in Phase 3. For now, here is each child's
		skill record.
	</p>

	{#each data.children as kid (kid.id)}
		<section>
			<h2><span aria-hidden="true">{kid.avatar}</span> {kid.displayName}</h2>
			<div class="table-wrap">
				<table>
					<thead>
						<tr
							><th scope="col">Topic</th><th scope="col">Skill</th><th scope="col">Level</th><th
								scope="col">Score</th
							><th scope="col">Attempts</th><th scope="col">Accuracy</th><th scope="col"
								>Next review</th
							></tr
						>
					</thead>
					<tbody>
						{#each kid.skills as skill (skill.id)}
							<tr>
								<td>{skill.topic}</td>
								<td>{skill.title}</td>
								<td>{skill.level}</td>
								<td>{skill.score}</td>
								<td>{skill.attempts}</td>
								<td>{skill.accuracy === null ? '–' : `${skill.accuracy}%`}</td>
								<td
									>{skill.nextReviewAt
										? new Date(skill.nextReviewAt).toLocaleDateString('en-GB')
										: '–'}</td
								>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>
	{/each}

	<section>
		{#if form?.added}<p role="status">Added {form.added}.</p>{/if}
		{#if !adding}
			<Button variant="secondary" onclick={() => (adding = true)}>Add a child</Button>
		{:else}
			<form
				method="POST"
				action="?/addChild"
				use:enhance={() =>
					async ({ update }) => {
						await update();
						adding = false;
					}}
				class="add"
			>
				<h2>Add a child</h2>
				<label>First name or nickname <input name="name" required maxlength="30" /></label>
				<label>
					Year group
					<select name="yearGroup"
						>{#each [5, 6, 7, 8] as y (y)}<option value={y}>Year {y}</option>{/each}</select
					>
				</label>
				<label>
					Avatar
					<select name="avatar"
						>{#each data.avatars as a (a)}<option value={a}>{a}</option>{/each}</select
					>
				</label>
				<p>Picture PIN (optional)</p>
				<PinPad kind="picture" pictures={data.pictures} name="childPin" />
				{#if form?.message}<p class="error" role="alert">{form.message}</p>{/if}
				<Button type="submit">Add</Button>
			</form>
		{/if}
	</section>
</main>

<style>
	.bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		background: var(--surface);
		border-bottom: 2px solid var(--line);
	}

	.bar h1 {
		flex: 1;
		margin: 0;
		font-size: var(--text-xl);
	}

	main {
		max-width: 70rem;
		margin: 0 auto;
		padding: var(--space-6) var(--space-4);
	}

	.lead {
		color: var(--ink-soft);
	}

	section {
		margin-bottom: var(--space-8);
	}

	.table-wrap {
		overflow-x: auto;
	}

	table {
		border-collapse: collapse;
		width: 100%;
		background: var(--surface);
		font-size: var(--text-sm);
	}

	th,
	td {
		text-align: left;
		padding: var(--space-2) var(--space-3);
		border-bottom: 1px solid var(--line);
	}

	.add {
		display: grid;
		gap: var(--space-3);
		max-width: var(--measure);
		background: var(--surface);
		border: 2px solid var(--line);
		border-radius: var(--radius-lg);
		padding: var(--space-6);
	}

	label {
		display: grid;
		gap: var(--space-1);
	}

	input,
	select {
		min-height: var(--tap-min);
		border: 2px solid var(--line);
		border-radius: var(--radius-sm);
		padding-inline: var(--space-3);
	}

	.error {
		color: var(--nudge);
		font-weight: 600;
	}
</style>
