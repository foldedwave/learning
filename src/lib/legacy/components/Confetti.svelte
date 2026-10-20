<script lang="ts">
	const COLORS = ['#d4a017', '#c2593f', '#4a2545', '#4caf50', '#2196f3', '#ffeb3b'];

	interface Particle {
		x: number;
		y: number;
		vx: number;
		vy: number;
		size: number;
		color: string;
		rotation: number;
		rotSpeed: number;
		opacity: number;
	}

	/** Bump this number to fire a burst. */
	let { trigger }: { trigger: number } = $props();

	let canvas: HTMLCanvasElement;
	let width = $state(0);
	let height = $state(0);
	let frame = 0;

	$effect(() => {
		if (trigger > 0) burst();
		return () => cancelAnimationFrame(frame);
	});

	function burst() {
		const ctx = canvas.getContext('2d')!;
		const particles: Particle[] = Array.from({ length: 90 }, () => ({
			x: width / 2,
			y: height / 2,
			vx: (Math.random() - 0.5) * 16,
			vy: (Math.random() - 0.7) * 18,
			size: Math.random() * 8 + 4,
			color: COLORS[Math.floor(Math.random() * COLORS.length)],
			rotation: Math.random() * 360,
			rotSpeed: (Math.random() - 0.5) * 10,
			opacity: 1
		}));

		cancelAnimationFrame(frame);

		function tick() {
			ctx.clearRect(0, 0, width, height);
			let alive = false;
			for (const p of particles) {
				p.x += p.vx;
				p.y += p.vy;
				p.vy += 0.45; // gravity
				p.rotation += p.rotSpeed;
				p.opacity -= 0.012;
				if (p.opacity <= 0) continue;

				alive = true;
				ctx.save();
				ctx.translate(p.x, p.y);
				ctx.rotate((p.rotation * Math.PI) / 180);
				ctx.fillStyle = p.color;
				ctx.globalAlpha = p.opacity;
				ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
				ctx.restore();
			}
			if (alive) frame = requestAnimationFrame(tick);
			else ctx.clearRect(0, 0, width, height);
		}
		tick();
	}
</script>

<svelte:window bind:innerWidth={width} bind:innerHeight={height} />

<canvas bind:this={canvas} {width} {height} aria-hidden="true"></canvas>

<style>
	canvas {
		position: fixed;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 150;
	}
</style>
