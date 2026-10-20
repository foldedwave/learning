<script lang="ts">
	import './legacy.css';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<title>Roman Quest: The Ancient Numeral Adventure</title>
</svelte:head>

<div class="legacy-roman">
	{@render children()}
</div>
