<script lang="ts">
	import Modal from './Modal.svelte';

	let { open = $bindable(false) }: { open?: boolean } = $props();
</script>

<Modal bind:open label="The 4 Golden Laws of Rome">
	<h2>📜 The 4 Golden Laws of Rome</h2>
	<div class="modal-section">
		<div class="rule-box">
			<strong>1. Addition Rule:</strong> Numerals placed after a larger (or equal) numeral are
			ADDED.<br />
			<em>VI = 5 + 1 = 6 | LXX = 50 + 10 + 10 = 70</em>
		</div>
		<div class="rule-box">
			<strong>2. Rule of Three:</strong> You can NEVER write the same basic symbol more than 3 times
			in a row! V, L, and D can NEVER be repeated at all.<br />
			<em>III = 3, but 4 is IV (never IIII)!</em>
		</div>
		<div class="rule-box">
			<strong>3. Subtraction & Place-Value Rule:</strong> A smaller symbol placed BEFORE a larger
			symbol is SUBTRACTED. Crucially, subtraction works column by column! You only subtract powers
			of ten (I, X, C) from the next two higher ranks.<br />
			<em>49 = 40 (XL) + 9 (IX) = XLIX (NEVER IL!)</em>
		</div>
		<div class="rule-box">
			<strong>4. The Vinculum Roof Bar (×1,000):</strong> A line drawn directly over any Roman
			numeral multiplies its total value by 1,000!<br />
			<em>V̄ = 5,000 | X̄ = 10,000 | M̄ = 1,000,000</em>
		</div>
	</div>
</Modal>

<style>
	h2 {
		color: var(--imperial-purple);
		font-size: 1.5rem;
		font-weight: 900;
		margin-bottom: 18px;
		padding-right: 40px;
	}
</style>
