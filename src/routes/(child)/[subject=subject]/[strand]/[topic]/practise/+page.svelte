<script lang="ts">
	import { untrack } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import Runner from '#lib/components/questions/Runner.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// The focus skill is fixed when the page opens, so finishing a session (which reloads the
	// data and may move the focus on) does not swap the skill under the child mid-result.
	// ?skill= lets "warm up on a prerequisite" links and the picker choose a different one.
	const focus = untrack(() => data.focus.skillId);
	const requested = $derived(page.url.searchParams.get('skill'));
	const current = $derived(
		data.skills.find((s) => s.id === requested && s.unlocked) ??
			data.skills.find((s) => s.id === focus)!
	);
</script>

<svelte:head><title>Practise · {data.topicTitle}</title></svelte:head>

<label class="picker">
	Working on
	<select
		value={current.id}
		onchange={(e) => goto(`?skill=${e.currentTarget.value}`, { replaceState: true })}
	>
		{#each data.skills.filter((s) => s.unlocked) as skill (skill.id)}
			<option value={skill.id}>{skill.title}</option>
		{/each}
	</select>
</label>

{#key current.id}
	<Runner
		topicId={data.topicId}
		skillId={current.id}
		level={current.level}
		mode="practise"
		base={data.base}
	/>
{/key}

<style>
	.picker {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-3);
		margin-bottom: var(--space-4);
		font-weight: 600;
	}

	select {
		min-height: var(--tap-min);
		border: 2px solid var(--line);
		border-radius: var(--radius-md);
		padding-inline: var(--space-3);
		background: var(--surface);
	}
</style>
