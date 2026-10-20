import { describe, expect, it } from 'vitest';
import { plainText, renderMarkdown } from './markdown.ts';

describe('renderMarkdown', () => {
	it('renders paragraphs, lists and emphasis', () => {
		expect(renderMarkdown('Hello **world**\n\n- *one*\n- two')).toBe(
			'<p>Hello <strong>world</strong></p><ul><li><em>one</em></li><li>two</li></ul>'
		);
	});

	it('escapes HTML', () => {
		expect(renderMarkdown('<script>x</script> & "q"')).toBe(
			'<p>&lt;script&gt;x&lt;/script&gt; &amp; &quot;q&quot;</p>'
		);
	});

	it('strips markers for speech', () => {
		expect(plainText('**IV** = 4\n- *five*')).toBe('IV = 4\nfive');
	});
});
