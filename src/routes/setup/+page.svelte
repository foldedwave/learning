<script lang="ts">
	import Button from '#lib/components/ui/Button.svelte';
	import PinPad from '#lib/components/ui/PinPad.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head><title>Set up · Home Learning</title></svelte:head>

<main>
	<h1>Welcome! Let's set things up.</h1>
	<p>This creates the parent PIN and the first child's profile. You can add more children later.</p>

	<form method="POST">
		<fieldset>
			<legend>Parent PIN</legend>
			<label
				>PIN (4 to 6 digits) <input
					name="pin"
					type="password"
					inputmode="numeric"
					autocomplete="new-password"
					required
					pattern={'\\d{4,6}'}
				/></label
			>
			<label
				>Type it again <input
					name="confirm"
					type="password"
					inputmode="numeric"
					autocomplete="new-password"
					required
				/></label
			>
		</fieldset>

		<fieldset>
			<legend>First child</legend>
			<label
				>First name or nickname <input
					name="name"
					required
					maxlength="30"
					value={form?.name ?? ''}
				/></label
			>
			<label>
				Year group
				<select name="yearGroup" required>
					{#each [5, 6, 7, 8] as y (y)}
						<option value={y} selected={(form?.yearGroup ?? 6) === y}>Year {y}</option>
					{/each}
				</select>
			</label>
			<div role="radiogroup" aria-label="Avatar" class="avatars">
				{#each data.avatars as avatar, i (avatar)}
					<label class="avatar">
						<input
							type="radio"
							name="avatar"
							value={avatar}
							checked={form?.avatar ? form.avatar === avatar : i === 0}
						/>
						<span>{avatar}</span>
					</label>
				{/each}
			</div>
			<p>Picture PIN (optional): tap three pictures the child will remember.</p>
			<PinPad kind="picture" pictures={data.pictures} name="childPin" />
		</fieldset>

		{#if form?.message}<p class="error" role="alert">{form.message}</p>{/if}
		<Button type="submit">Create</Button>
	</form>
</main>

<style>
	main {
		max-width: var(--measure);
		margin: 0 auto;
		padding: var(--space-8) var(--space-4);
	}

	form {
		display: grid;
		gap: var(--space-6);
	}

	fieldset {
		display: grid;
		gap: var(--space-4);
		border: 2px solid var(--line);
		border-radius: var(--radius-lg);
		background: var(--surface);
		padding: var(--space-6);
	}

	legend {
		font-weight: 600;
		font-size: var(--text-lg);
	}

	label {
		display: grid;
		gap: var(--space-1);
	}

	input:not([type='radio']),
	select {
		min-height: var(--tap-min);
		border: 2px solid var(--line);
		border-radius: var(--radius-sm);
		padding-inline: var(--space-3);
	}

	.avatars {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.avatar {
		display: block;
	}

	.avatar input {
		position: absolute;
		opacity: 0;
	}

	.avatar span {
		display: grid;
		place-items: center;
		width: calc(var(--tap-min) * 1.3);
		height: calc(var(--tap-min) * 1.3);
		font-size: var(--text-2xl);
		border: 3px solid var(--line);
		border-radius: var(--radius-md);
		cursor: pointer;
	}

	.avatar input:checked + span {
		border-color: var(--ink);
	}

	.avatar input:focus-visible + span {
		outline: 3px solid var(--focus);
	}

	.error {
		color: var(--nudge);
		font-weight: 600;
	}
</style>
