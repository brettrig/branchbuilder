import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

mermaid.initialize({ startOnLoad: false, theme: 'default' });

let renderCount = 0;
const lastGoodSvgByElementId = new Map();

export async function renderDiagram(elementId, definition) {
    const container = document.getElementById(elementId);
    if (!container) {
        return;
    }

    // Mermaid can leave a stale temp node behind after a failed parse, so each
    // render attempt gets its own unique id to avoid colliding with leftovers.
    const svgId = `${elementId}-svg-${++renderCount}`;

    try {
        const { svg } = await mermaid.render(svgId, definition);
        lastGoodSvgByElementId.set(elementId, svg);
        container.innerHTML = svg;
    } catch (error) {
        // Keep showing the last valid diagram (e.g. while the user is still
        // mid-edit) instead of replacing it with a jarring error message.
        const lastGoodSvg = lastGoodSvgByElementId.get(elementId);
        container.innerHTML = lastGoodSvg
            ? `${lastGoodSvg}<pre class="mermaid-diagram-error">${error}</pre>`
            : `<pre class="mermaid-diagram-error">${error}</pre>`;
        // Mermaid can leave its temporary render node attached to the document
        // (outside our container) when parsing fails; clean that up only.
        document.getElementById(svgId)?.remove();
    }
}
