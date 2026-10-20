import type { SoundType } from './types';

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
	if (!audioCtx) {
		const Ctor =
			window.AudioContext ??
			(window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
		if (Ctor) audioCtx = new Ctor();
	}
	return audioCtx;
}

function tone(
	ctx: AudioContext,
	type: OscillatorType,
	start: number,
	duration: number,
	shape: (osc: OscillatorNode, gain: GainNode) => void
) {
	const osc = ctx.createOscillator();
	const gain = ctx.createGain();
	osc.connect(gain);
	gain.connect(ctx.destination);
	osc.type = type;
	shape(osc, gain);
	osc.start(start);
	osc.stop(start + duration);
}

/** Plays a short synthesized sound effect. Browser-only. */
export function playSound(type: SoundType) {
	const ctx = getContext();
	if (!ctx) return;
	if (ctx.state === 'suspended') void ctx.resume();
	const now = ctx.currentTime;

	if (type === 'correct') {
		tone(ctx, 'triangle', now, 0.4, (osc, gain) => {
			osc.frequency.setValueAtTime(523.25, now); // C5
			osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08); // E5
			osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.16); // G5
			osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.24); // C6
			gain.gain.setValueAtTime(0.2, now);
			gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
		});
	} else if (type === 'wrong') {
		tone(ctx, 'sawtooth', now, 0.3, (osc, gain) => {
			osc.frequency.setValueAtTime(220, now);
			osc.frequency.linearRampToValueAtTime(160, now + 0.25);
			gain.gain.setValueAtTime(0.2, now);
			gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
		});
	} else {
		// Star fanfare
		[523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((freq, i) => {
			const t = now + i * 0.09;
			tone(ctx, 'sine', t, 0.35, (osc, gain) => {
				osc.frequency.setValueAtTime(freq, t);
				gain.gain.setValueAtTime(0.2, t);
				gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
			});
		});
	}
}
