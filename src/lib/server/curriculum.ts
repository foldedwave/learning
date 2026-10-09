import type { Concept } from '../roman/types';

/**
 * The Roman Quest curriculum. Lives server-side and is served through the
 * `getCurriculum` remote function, so it can move into a database later
 * without changing the UI.
 */
export const CURRICULUM: Concept[] = [
	{
		id: 1,
		title: 'Additive Basics & Rule of 3',
		shortName: '1. Basics & Add',
		tag: 'Concept 1',
		description:
			'Learn how Roman numerals add together like toy bricks, and discover why you can never stack more than 3 of the same letter!',
		tip: 'Rule: I, X, C, M can repeat up to 3 times. V, L, D never repeat!',
		lessonHtml: `
          <div class="modal-section">
            <h4>🧱 The Big Idea: Addition</h4>
            <p>The Romans counted using single symbols: <strong>I = 1</strong>, <strong>V = 5</strong>, and <strong>X = 10</strong>.</p>
            <p>When you place smaller or equal numbers to the RIGHT, you simply add them up!</p>
            <div class="rule-box">
              • II = 1 + 1 = 2<br>
              • VI = 5 + 1 = 6<br>
              • VII = 5 + 1 + 1 = 7<br>
              • XI = 10 + 1 = 11<br>
              • XV = 10 + 5 = 15
            </div>
          </div>
          <div class="modal-section">
            <h4>⛔ The Rule of 3</h4>
            <p>You can <strong>NEVER write the same letter four times in a row</strong>! 4 is not IIII, and 14 is not XIIII.</p>
            <p>Also, <strong>V is never repeated</strong> because V + V is 10, and the Romans already had X for that!</p>
          </div>
        `
	},
	{
		id: 2,
		title: 'Subtraction Magic (IV & IX)',
		shortName: '2. Subtraction',
		tag: 'Concept 2',
		description:
			"What happens when 3 repeats isn't enough? Put a smaller number in front to subtract!",
		tip: 'IV is 5 - 1 = 4. IX is 10 - 1 = 9. Only ONE letter can be subtracted!',
		lessonHtml: `
          <div class="modal-section">
            <h4>🪄 Subtraction Magic</h4>
            <p>To avoid writing four symbols like IIII, Romans placed a smaller symbol to the <strong>LEFT</strong> of a bigger one. That means: <em>Take away!</em></p>
            <div class="rule-box">
              • <strong>IV</strong> = 5 minus 1 = <strong>4</strong><br>
              • <strong>IX</strong> = 10 minus 1 = <strong>9</strong><br>
              • <strong>XIV</strong> = 10 + 4 = <strong>14</strong><br>
              • <strong>XIX</strong> = 10 + 9 = <strong>19</strong>
            </div>
          </div>
          <div class="modal-section">
            <h4>⚠️ Titus's Trap Alert</h4>
            <p>You can only subtract <strong>one single symbol</strong>! 8 is VIII (5 + 3), never IIX (10 - 2).</p>
          </div>
        `
	},
	{
		id: 3,
		title: 'Tens Titans (L & C)',
		shortName: '3. Tens (L & C)',
		tag: 'Concept 3',
		description: 'Meet L (50) and C (100)! Learn how tens add and subtract (XL = 40, XC = 90).',
		tip: 'L = 50, C = Century (100). XL is 50 - 10 = 40. XC is 100 - 10 = 90.',
		lessonHtml: `
          <div class="modal-section">
            <h4>🏛️ The Titans: L (50) and C (100)</h4>
            <p>Think of <strong>C</strong> as Century (100 years or 100 Roman soldiers!). <strong>L</strong> is half of 100 = 50.</p>
            <p>Tens follow the exact same subtraction rules as units:</p>
            <div class="rule-box">
              • <strong>XL</strong> = 50 - 10 = <strong>40</strong><br>
              • <strong>LX</strong> = 50 + 10 = <strong>60</strong><br>
              • <strong>LXX</strong> = 50 + 20 = <strong>70</strong><br>
              • <strong>XC</strong> = 100 - 10 = <strong>90</strong>
            </div>
          </div>
        `
	},
	{
		id: 4,
		title: 'The Place-Value Secret (Chunking)',
		shortName: '4. Chunking Rule',
		tag: 'Concept 4',
		description:
			'Master the most common mistake in the ancient world: Why 49 is XLIX and NEVER IL!',
		tip: 'Always break a number into place values: Tens chunk + Ones chunk. 49 = 40 + 9 = XL + IX = XLIX!',
		lessonHtml: `
          <div class="modal-section">
            <h4>🧩 The Great Chunking Secret</h4>
            <p>In standard Roman numerals, you <strong>must convert place values independently</strong>, exactly like expanded form in school math!</p>
            <div class="rule-box">
              <strong>Question: How do you write 49?</strong><br><br>
              ❌ Child's Common Guess: <em>IL (50 - 1)</em> — <strong>INCORRECT!</strong><br>
              ✔️ The Roman Way: Break into tens and ones first!<br>
              • Tens: 40 = <strong>XL</strong><br>
              • Ones: 9 = <strong>IX</strong><br>
              • Combine: <strong>XLIX</strong>
            </div>
            <p>Similarly, <strong>99 is NOT IC</strong>! 99 is 90 (XC) + 9 (IX) = <strong>XCIX</strong>.</p>
          </div>
        `
	},
	{
		id: 5,
		title: 'The Giants: D (500) & M (1,000)',
		shortName: '5. Hundreds (D & M)',
		tag: 'Concept 5',
		description:
			'Step into the realm of hundreds! D represents 500, M represents Millennium (1,000).',
		tip: 'CD is 500 - 100 = 400. CM is 1,000 - 100 = 900. C can subtract from D and M!',
		lessonHtml: `
          <div class="modal-section">
            <h4>🏰 The Giants: D & M</h4>
            <p><strong>D = 500</strong> and <strong>M = 1,000</strong> (Millennium!).</p>
            <p>The same subtraction pair works for hundreds:</p>
            <div class="rule-box">
              • <strong>CD</strong> = 500 - 100 = <strong>400</strong><br>
              • <strong>DC</strong> = 500 + 100 = <strong>600</strong><br>
              • <strong>CM</strong> = 1,000 - 100 = <strong>900</strong>
            </div>
            <p>Example: 444 = 400 (CD) + 40 (XL) + 4 (IV) = <strong>CDXLIV</strong>.</p>
          </div>
        `
	},
	{
		id: 6,
		title: 'The Standard System (Up to 3,999)',
		shortName: '6. Full System (3,999)',
		tag: 'Concept 6',
		description:
			'Combine all four place-value columns (Thousands, Hundreds, Tens, Ones) up to 3,999!',
		tip: '3,888 = MMM (3,000) + DCCC (800) + LXXX (80) + VIII (8). But what about 4,000? We need a new weapon!',
		lessonHtml: `
          <div class="modal-section">
            <h4>🎖️ Standard Four-Column Mastery</h4>
            <p>Any number up to 3,999 is written by converting each place value column from left to right:</p>
            <div class="rule-box">
              1,984 = 1,000 + 900 + 80 + 4<br>
              • 1,000 = <strong>M</strong><br>
              • 900 = <strong>CM</strong><br>
              • 80 = <strong>LXXX</strong><br>
              • 4 = <strong>IV</strong><br>
              = <strong>MCMLXXXIV</strong>
            </div>
            <p>Why does standard notation stop at 3,999? Because 4,000 would require MMMM, which breaks the Rule of Three!</p>
          </div>
        `
	},
	{
		id: 7,
		title: 'The Vinculum Roof Bar (×1,000)',
		shortName: '7. Vinculum (4K-9K)',
		tag: 'Concept 7',
		description:
			'Discover the ancient Roman superpower: a roof bar (Vinculum) that multiplies any numeral by 1,000!',
		tip: 'A bar on top means × 1,000! IV̄ = 4,000. V̄ = 5,000. IX̄ = 9,000.',
		hasVinculum: true,
		lessonHtml: `
          <div class="modal-section">
            <h4>⚡ The Ancient Superpower: The Vinculum</h4>
            <p>When the Romans had numbers larger than 3,999, they didn't invent new letters. Instead, they drew a horizontal line across the top called a <strong>Vinculum</strong> (Latin for 'roof' or 'bond').</p>
            <div class="rule-box">
              <strong>The Golden Vinculum Rule:</strong><br>
              A line over a numeral multiplies its value by <strong>1,000</strong>!<br><br>
              • <strong>IV̄</strong> = 4 × 1,000 = <strong>4,000</strong><br>
              • <strong>V̄</strong> = 5 × 1,000 = <strong>5,000</strong><br>
              • <strong>VIĪ</strong> = 7 × 1,000 = <strong>7,000</strong><br>
              • <strong>IX̄</strong> = 9 × 1,000 = <strong>9,000</strong>
            </div>
            <p>Example: 5,230 = 5,000 (V̄) + 200 (CC) + 30 (XXX) = <strong>V̄CCXXX</strong>.</p>
          </div>
        `
	},
	{
		id: 8,
		title: 'High Thousands to 900,000',
		shortName: '8. High Thousands',
		tag: 'Concept 8',
		description: 'Combine Vinculum roof bars for tens and hundreds of thousands up to 999,999!',
		tip: 'X̄ = 10,000 | L̄ = 50,000 | C̄ = 100,000 | D̄ = 500,000. Combine roof bars for the thousands chunk!',
		hasVinculum: true,
		lessonHtml: `
          <div class="modal-section">
            <h4>🌟 Big League Roof Bars</h4>
            <p>Multiply every Roman letter by 1,000 with the bar:</p>
            <div class="rule-box">
              • <strong>X̄</strong> = 10 × 1,000 = <strong>10,000</strong><br>
              • <strong>XL̄</strong> = 40 × 1,000 = <strong>40,000</strong><br>
              • <strong>L̄</strong> = 50 × 1,000 = <strong>50,000</strong><br>
              • <strong>C̄</strong> = 100 × 1,000 = <strong>100,000</strong><br>
              • <strong>CD̄</strong> = 400 × 1,000 = <strong>400,000</strong><br>
              • <strong>D̄</strong> = 500 × 1,000 = <strong>500,000</strong><br>
              • <strong>CM̄</strong> = 900 × 1,000 = <strong>900,000</strong>
            </div>
            <p>To write 75,000: 75 is LXXV, so 75,000 is <strong>L̄X̄X̄V̄</strong> (or LXXV with a bar over it!).</p>
          </div>
        `
	},
	{
		id: 9,
		title: "The Millionaires' Club",
		shortName: '9. Over 1 Million!',
		tag: 'Concept 9',
		description: 'Tackle numbers beyond one million! M with a roof bar equals 1,000,000!',
		tip: 'M̄ = 1,000 × 1,000 = 1,000,000! Two million is M̄M̄! Three million is M̄M̄M̄!',
		hasVinculum: true,
		lessonHtml: `
          <div class="modal-section">
            <h4>👑 Welcome to the Millionaires' Club</h4>
            <p>What is 1,000 times 1,000? <strong>One Million!</strong></p>
            <div class="rule-box">
              • <strong>M̄</strong> = 1,000 × 1,000 = <strong>1,000,000</strong> (One Million!)<br>
              • <strong>M̄M̄</strong> = <strong>2,000,000</strong><br>
              • <strong>M̄M̄M̄</strong> = <strong>3,000,000</strong>
            </div>
            <p>Example: 1,500,000 = 1,000,000 (M̄) + 500,000 (D̄) = <strong>M̄D̄</strong>.</p>
          </div>
        `
	},
	{
		id: 10,
		title: 'Grand Imperial Master',
		shortName: '10. Grand Master',
		tag: 'Concept 10',
		description:
			'The ultimate challenge! Randomized trials across every rule and common trick from 1 to 3,999,999.',
		tip: 'Remember the Golden Rules: Chunk by place value, watch subtraction pairs, and use roof bars for thousands!',
		hasVinculum: true,
		lessonHtml: `
          <div class="modal-section">
            <h4>🏆 Master of Ancient Rome</h4>
            <p>You have reached the pinnacle of Roman arithmetic! In this level, questions will test:</p>
            <div class="rule-box">
              1. Additive basics and the Rule of Three.<br>
              2. Tricky subtraction pairs (4, 9, 40, 90, 400, 900).<br>
              3. The Place-Value Trap (why 49 is XLIX, why 99 is XCIX).<br>
              4. Standard numbers up to 3,999.<br>
              5. The Vinculum Roof Bar for thousands, hundreds of thousands, and millions!
            </div>
          </div>
        `
	}
];
