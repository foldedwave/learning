const escape = (s: string) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const inline = (s: string) =>
	escape(s)
		.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
		.replace(/\*(.+?)\*/g, '<em>$1</em>');

/**
 * Renders the small markdown subset used in content files: paragraphs,
 * "- " bullet lists, **bold** and *italics*. Everything is escaped first,
 * so the output is safe even though content is authored and trusted.
 */
export function renderMarkdown(source: string): string {
	return source
		.trim()
		.split(/\n{2,}/)
		.map((block) => {
			const lines = block.split('\n');
			if (lines.every((l) => l.startsWith('- '))) {
				return `<ul>${lines.map((l) => `<li>${inline(l.slice(2))}</li>`).join('')}</ul>`;
			}
			return `<p>${lines.map(inline).join('<br>')}</p>`;
		})
		.join('');
}

/** Plain text for read-aloud: markdown markers removed. */
export function plainText(source: string): string {
	return source.replace(/\*\*?/g, '').replace(/^- /gm, '');
}
