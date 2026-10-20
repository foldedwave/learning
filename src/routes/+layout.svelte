<script lang="ts">
	import '@fontsource/lexend/400.css';
	import '@fontsource/lexend/600.css';
	import '../app.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Home Learning</title>
</svelte:head>

{@render children()}
