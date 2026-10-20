import type { Component } from 'svelte';
import RomanBuilder from './RomanBuilder.svelte';

/** Interactive models by the name used in content files ({ kind: 'model', model: 'roman-builder' }). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MODELS: Record<string, Component<any>> = {
	'roman-builder': RomanBuilder
};
