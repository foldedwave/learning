<script lang="ts">
	import Breadcrumb from '#lib/components/ui/Breadcrumb.svelte';
	import TopicTabs from '#lib/components/ui/TopicTabs.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<div class="subject-{data.subject}">
	<Breadcrumb items={data.crumbs} />
	<h1><span aria-hidden="true">{data.topicIcon}</span> {data.topicTitle}</h1>
	<TopicTabs base={data.base} stretchLocked={data.stretchLocked} />
	{@render children()}
</div>
