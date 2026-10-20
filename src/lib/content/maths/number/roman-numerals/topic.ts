import type { TopicDefinition } from '../../../types.ts';
import { GENERATORS, MISCONCEPTIONS, SKILLS } from './generators.ts';

export const romanNumerals: TopicDefinition = {
	id: 'maths.number.roman',
	slug: 'roman-numerals',
	subject: 'maths',
	strand: 'number',
	title: 'Roman numerals',
	icon: '🏛️',
	summary: 'Read and write numbers the way the Romans did, from I to M̄.',
	skills: [
		{
			id: SKILLS.to100,
			title: 'Roman numerals to 100',
			stage: 5,
			prerequisites: [],
			targetSeconds: 15
		},
		{
			id: SKILLS.to1000,
			title: 'Roman numerals to 1,000',
			stage: 6,
			prerequisites: [SKILLS.to100],
			targetSeconds: 20
		},
		{
			id: SKILLS.years,
			title: 'Years in Roman numerals',
			stage: 6,
			prerequisites: [SKILLS.to1000],
			targetSeconds: 25
		},
		{
			id: SKILLS.vinculum,
			title: 'Big numbers with the roof bar',
			stage: 7,
			prerequisites: [SKILLS.years],
			targetSeconds: 30
		}
	],
	learn: [
		{
			kind: 'explain',
			title: 'Letters as numbers',
			body: 'The Romans wrote numbers with seven letters:\n\n- **I** = 1\n- **V** = 5\n- **X** = 10\n- **L** = 50\n- **C** = 100\n- **D** = 500\n- **M** = 1,000\n\nA trick for remembering: **C** is for *century* (100 years) and **M** is for *millennium* (1,000 years).'
		},
		{
			kind: 'explain',
			title: 'Big first means add',
			body: 'When the letters go from **biggest to smallest**, you add them up.\n\n- **VI** = 5 + 1 = 6\n- **XV** = 10 + 5 = 15\n- **LXII** = 50 + 10 + 1 + 1 = 62\n\n**The rule of three:** I, X, C and M can repeat up to three times, but never four. V, L and D never repeat at all.'
		},
		{
			kind: 'explain',
			title: 'Small first means subtract',
			body: 'When a smaller letter comes **before** a bigger one, you take it away.\n\n- **IV** = 5 − 1 = 4\n- **IX** = 10 − 1 = 9\n- **XL** = 50 − 10 = 40\n- **XC** = 100 − 10 = 90\n- **CD** = 500 − 100 = 400\n- **CM** = 1,000 − 100 = 900\n\nThese six pairs are the **only** subtractions allowed.'
		},
		{
			kind: 'worked-example',
			title: 'Writing 49, step by step',
			steps: [
				{ text: 'Split 49 into place-value chunks: tens and ones.', highlight: '49 = 40 + 9' },
				{ text: 'Write the tens chunk. 40 is 10 less than 50.', highlight: '40 = XL' },
				{ text: 'Write the ones chunk. 9 is 1 less than 10.', highlight: '9 = IX' },
				{ text: 'Put the chunks together, biggest first.', highlight: '49 = XLIX' },
				{
					text: 'Why not IL? You can only subtract inside one place value, so I can only come before V or X.',
					highlight: 'IL ✗   XLIX ✓'
				}
			]
		},
		{
			kind: 'model',
			title: 'The Roman number builder',
			model: 'roman-builder',
			props: { start: 1984 },
			prompt:
				'Type a number and watch it split into place-value chunks. Try 49, 99, 444 and the year you were born.'
		},
		{
			kind: 'explain',
			title: 'Years and really big numbers',
			body: 'Films, clocks and old buildings use Roman numerals for **years**. Split the year into thousands, hundreds, tens and ones:\n\n- **MMXXVI** = 2,000 + 20 + 6 = 2026\n\nFor numbers of 4,000 and more, the Romans drew a **roof bar** over a letter, which multiplies it by 1,000:\n\n- **V̄** = 5,000\n- **X̄** = 10,000'
		},
		{
			kind: 'check-in',
			title: 'Did that make sense?',
			generatorId: 'roman.to-roman.to100',
			difficulty: 2
		}
	],
	alternative: [
		{
			kind: 'explain',
			title: 'Think of it like money',
			body: 'Imagine the letters are coins: **I** is a 1p coin, **V** is 5p, **X** is 10p, **L** is 50p and **C** is £1.\n\nTo pay 27p you would use 10p + 10p + 5p + 1p + 1p, which is **XXVII**.\n\nThe Romans liked to use as few coins as possible, so instead of four 1p coins for 4p they wrote "1p short of 5p": **IV**.'
		},
		{
			kind: 'worked-example',
			title: 'One column at a time',
			steps: [
				{
					text: 'Write the number in a place-value chart.',
					highlight: '3 hundreds, 4 tens, 9 ones'
				},
				{ text: 'Hundreds: 300', highlight: 'CCC' },
				{ text: 'Tens: 40', highlight: 'XL' },
				{ text: 'Ones: 9', highlight: 'IX' },
				{ text: 'Read the columns left to right.', highlight: '349 = CCCXLIX' }
			]
		}
	],
	generators: GENERATORS,
	misconceptions: [
		{
			id: MISCONCEPTIONS.additiveOnly,
			skillId: SKILLS.to100,
			description: 'Adds every symbol, so reads IV as 6 or XC as 110.',
			feedback:
				'Not quite! Look for a smaller letter **before** a bigger one. That pair means subtract, so IV is 5 − 1 = 4, not 6.',
			reteach: [
				{
					kind: 'explain',
					title: 'Spot the subtraction pairs',
					body: 'Read the numeral from left to right. Each time a letter is **smaller** than the one after it, that pair is a subtraction.\n\n- **XIV**: X, then **IV**. 10 + 4 = 14\n- **XCIX**: **XC**, then **IX**. 90 + 9 = 99\n\nDraw a box around each pair first, then add the boxes up.'
				}
			]
		},
		{
			id: MISCONCEPTIONS.acrossPlaces,
			skillId: SKILLS.to100,
			description: 'Subtracts across place values, writing 49 as IL or 99 as IC.',
			feedback:
				'So close! You can only subtract within one place value. Split the number into tens and ones first: 49 is 40 + 9, which is XL + IX.',
			reteach: [
				{
					kind: 'worked-example',
					title: 'Chunk first, then write',
					steps: [
						{
							text: '99 looks like "1 less than 100", but the Romans did not write it that way.',
							highlight: 'IC ✗'
						},
						{ text: 'Split into tens and ones.', highlight: '99 = 90 + 9' },
						{ text: 'Tens: 90 is 10 less than 100.', highlight: '90 = XC' },
						{ text: 'Ones: 9 is 1 less than 10.', highlight: '9 = IX' },
						{ text: 'Join them.', highlight: '99 = XCIX ✓' }
					]
				}
			]
		},
		{
			id: MISCONCEPTIONS.fourRepeats,
			skillId: SKILLS.to100,
			description:
				'Writes four identical symbols in a row (IIII, XXXX) instead of a subtraction pair.',
			feedback:
				'Nearly! A letter can repeat three times at most. For 4 use IV, for 40 use XL and for 400 use CD.',
			reteach: [
				{
					kind: 'explain',
					title: 'The rule of three',
					body: "After three of the same letter, switch to a subtraction pair:\n\n- 3 = III, but 4 = **IV**\n- 30 = XXX, but 40 = **XL**\n- 300 = CCC, but 400 = **CD**\n\n(Some clocks show IIII. That is a clockmaker's tradition, not the standard rule.)"
				}
			]
		},
		{
			id: MISCONCEPTIONS.reversed,
			skillId: SKILLS.to100,
			description: 'Puts the smaller symbol on the wrong side, writing 4 as VI or 40 as LX.',
			feedback:
				'Check the order! A smaller letter **after** a bigger one adds (VI = 6). To subtract, it goes **before** (IV = 4).',
			reteach: [
				{
					kind: 'explain',
					title: 'Before takes away, after adds on',
					body: 'Think of V as a number line at 5.\n\n- Step **back** one before it: **IV** = 4\n- Step **forward** one after it: **VI** = 6\n\nThe same works for X: **IX** = 9 and **XI** = 11.'
				}
			]
		},
		{
			id: MISCONCEPTIONS.vinculumIgnored,
			skillId: SKILLS.vinculum,
			description: 'Ignores the roof bar (vinculum), reading V̄ as 5 instead of 5,000.',
			feedback: 'Look at the roof! A bar over a letter multiplies it by 1,000, so V̄ is 5,000.',
			reteach: [
				{
					kind: 'explain',
					title: 'The roof bar multiplies by 1,000',
					body: 'Read the barred letters as an ordinary numeral, then multiply by 1,000:\n\n- **X̄V̄** → XV = 15 → 15,000\n- **V̄CC** → V̄ = 5,000, then CC = 200 → 5,200'
				}
			]
		}
	],
	stretch: [
		{
			id: 'roman.stretch.one-of-each',
			skillId: SKILLS.to1000,
			title: 'One of each',
			prompt:
				'Use each of the letters **M, D, C, L, X, V and I** exactly once, biggest first. What number do you make?',
			answer: '1666',
			modelAnswer: 'MDCLXVI = 1,000 + 500 + 100 + 50 + 10 + 5 + 1 = 1,666.'
		},
		{
			id: 'roman.stretch.add-numerals',
			skillId: SKILLS.to100,
			title: 'Roman addition',
			prompt: 'Work out **XLVII + LIII**. Give your answer as a Roman numeral.',
			answer: 'C',
			modelAnswer: 'XLVII = 47 and LIII = 53. 47 + 53 = 100, which is C.'
		},
		{
			id: 'roman.stretch.longest',
			skillId: SKILLS.years,
			title: 'The longest year',
			prompt:
				'Which year between 1 and 2026 has the **longest** Roman numeral? How many letters does it have?',
			answer: '1888',
			modelAnswer:
				'1888 = MDCCCLXXXVIII, with 13 letters. 8 is the longest digit (VIII, LXXX, DCCC), so you want as many 8s as possible.'
		},
		{
			id: 'roman.stretch.clock',
			skillId: SKILLS.to100,
			title: "The clockmaker's four",
			prompt:
				"Many clocks show four o'clock as **IIII** instead of IV. Can you think of a reason a clockmaker might do that? Explain your idea.",
			modelAnswer:
				'There is no single right answer. Ideas include: IIII balances the VIII on the other side of the dial; IIII is easier to read upside down; it was simply a tradition. Any sensible reason with an explanation is a good answer.'
		}
	],
	resources: [
		{
			url: 'https://www.bbc.co.uk/bitesize/search?q=roman%20numerals',
			title: 'BBC Bitesize: Roman numerals',
			source: 'BBC Bitesize',
			kind: 'video',
			skillIds: [SKILLS.to100, SKILLS.to1000]
		}
	]
};
