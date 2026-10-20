<script lang="ts">
	import type { Concept } from '../roman/types';
	import Modal from './Modal.svelte';

	let { open = $bindable(false), concept }: { open?: boolean; concept: Concept } = $props();
</script>

<Modal bind:open label={concept.title}>
	<header>
		<span class="concept-tag">{concept.tag}</span>
		<h2>{concept.title}</h2>
	</header>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- authored curriculum content, not user input -->
	<div>{@html concept.lessonHtml}</div>
</Modal>

<style>
	header {
		margin-bottom: 18px;
		padding-right: 40px;
	}

	h2 {
		color: var(--imperial-purple);
		font-size: 1.5rem;
		font-weight: 900;
	}
</style>
