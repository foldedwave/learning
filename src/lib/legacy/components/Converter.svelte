<script lang="ts">
	import { MAX_ROMAN, toRoman } from '#lib/content/maths/number/roman-numerals/convert.ts';

	let value = $state<number | null>(1984);

	const result = $derived.by(() => {
		const n = Math.trunc(value ?? 0);
		return n > 0 && n <= MAX_ROMAN ? toRoman(n) : '— (Enter 1 to 3,999,999)';
	});
</script>

<section>
	<h3><span>🧪</span> The Roman Number Converter Machine</h3>
	<p>
		Type any number from 1 to 3,999,999 to see how Titus breaks it down into ancient Roman stones!
	</p>
	<div class="inputs">
		<input
			type="number"
			aria-label="Number to convert"
			placeholder="e.g. 1984"
			min="1"
			max={MAX_ROMAN}
			bind:value
		/>
		<span class="arrow">➔</span>
		<output>{result}</output>
	</div>
</section>

<style>
	section {
		margin-top: 30px;
		background: var(--card-bg);
		border-radius: var(--radius);
		padding: 20px;
		border: 2px solid var(--stone-border);
	}

	h3 {
		font-size: 1.15rem;
		color: var(--imperial-purple);
		font-weight: 800;
		margin-bottom: 10px;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	p {
		font-size: 0.88rem;
		color: #554944;
		margin-bottom: 12px;
	}

	.inputs {
		display: flex;
		gap: 12px;
		align-items: center;
		flex-wrap: wrap;
	}

	input {
		padding: 10px 14px;
		border: 2px solid var(--stone-border);
		border-radius: 10px;
		font-size: 1.05rem;
		font-weight: 700;
		width: 180px;
	}

	.arrow {
		font-weight: 800;
		font-size: 1.2rem;
		color: var(--terracotta);
	}

	output {
		font-size: 1.4rem;
		font-weight: 900;
		color: var(--terracotta);
		letter-spacing: 1px;
	}
</style>
