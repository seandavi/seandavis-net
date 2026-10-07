// Document-local figures, tables, and references. Deliberately small: it numbers
// captioned figures and tables within ONE document and resolves links to them.
// Equations, theorems, sections, subfigures, and multi-format output are Quarto's
// job (see docs/publishing.md).
//
// Authoring contract
//
//   ![Alt text describing the image](./plot.png)
//
//   Figure: Visible caption, with *Markdown*. {#fig-coverage}
//
//   | a | b |
//   |---|---|
//   | 1 | 2 |
//
//   Table: Caption for the table above. {#tbl-counts}
//
//   See [](#fig-coverage) and [](#tbl-counts).        -> "Figure 1", "Table 1"
//
// A `Figure:` / `Table:` caption paragraph must end in a `{#fig-…}` / `{#tbl-…}`
// label and sit directly after its image paragraph / table. The image becomes
// `<figure id><img><figcaption>`; the table becomes `<figure id><figcaption>
// <table></figure>` (caption on top). Alt text stays the image's own and is never
// reused as the caption. A link whose target starts `#fig-` or `#tbl-` is a
// reference; empty link text is filled with "Figure N" / "Table N". Duplicate
// labels, unresolved references, and orphaned captions fail the build.
// Images and tables without a caption paragraph render exactly as before.

const KINDS = {
  fig: { word: 'Figure', caption: 'Figure' },
  tbl: { word: 'Table', caption: 'Table' },
};
const LABEL = /\{#((?:fig|tbl)-[A-Za-z0-9][A-Za-z0-9_-]*)\}\s*$/;
const CAPTION = /^(Figure|Table):\s+/;

/** The lone image of a paragraph (ignoring whitespace-only text), else undefined. */
function loneImage(node) {
  if (node.type !== 'paragraph') return undefined;
  const kids = node.children.filter((c) => !(c.type === 'text' && !c.value.trim()));
  return kids.length === 1 && kids[0].type === 'image' ? kids[0] : undefined;
}

/** Parse a caption paragraph into { kind, label, children }, or undefined if it isn't one. */
function parseCaption(node) {
  if (node.type !== 'paragraph') return undefined;
  const first = node.children[0];
  const last = node.children[node.children.length - 1];
  if (first?.type !== 'text' || last?.type !== 'text') return undefined;
  const lead = first.value.match(CAPTION);
  const tail = last.value.match(LABEL);
  if (!lead || !tail) return undefined;
  const label = tail[1];
  const kind = lead[1] === 'Figure' ? 'fig' : 'tbl';
  if (!label.startsWith(kind + '-')) {
    throw { node, message: `${lead[1]}: caption has label {#${label}}; expected a {#${kind}-…} label` };
  }
  // Work on copies so the strip of "Figure: " and "{#…}" doesn't alias a shared text node.
  const children = node.children.map((c) => ({ ...c }));
  children[0].value = children[0].value.slice(lead[0].length);
  const end = children.length - 1;
  children[end].value = children[end].value.slice(0, children[end].value.length - tail[0].length).replace(/\s+$/, '');
  return { kind, label, children: children.filter((c) => c.type !== 'text' || c.value !== '') };
}

function walk(node, fn) {
  fn(node);
  if (node.children) for (const child of node.children) walk(child, fn);
}

export default function remarkFigures() {
  return (tree, file) => {
    const fail = (message, node) => file.fail(message, node);
    const labels = new Map(); // label -> { kind, number }
    const counters = { fig: 0, tbl: 0 };

    // Pass 1 (top level only): pair artifacts with caption paragraphs and number them.
    const out = [];
    const kids = tree.children;
    for (let i = 0; i < kids.length; i++) {
      const node = kids[i];
      let caption;
      try {
        caption = parseCaption(node);
      } catch (e) {
        fail(e.message, e.node);
      }
      if (!caption) {
        out.push(node);
        continue;
      }
      const target = out[out.length - 1];
      const wantsImage = caption.kind === 'fig';
      const ok = target && (wantsImage ? loneImage(target) : target.type === 'table');
      if (!ok) {
        fail(
          `Caption {#${caption.label}} must directly follow ${wantsImage ? 'an image paragraph' : 'a table'}`,
          node,
        );
      }
      if (labels.has(caption.label)) fail(`Duplicate label {#${caption.label}}`, node);
      const number = ++counters[caption.kind];
      labels.set(caption.label, { kind: caption.kind, number });
      const { word } = KINDS[caption.kind];

      const figcaption = {
        type: 'paragraph',
        data: { hName: 'figcaption' },
        children: [
          { type: 'strong', data: { hProperties: { className: ['fig-label'] } }, children: [{ type: 'text', value: `${word} ${number}.` }] },
          { type: 'text', value: ' ' },
          ...caption.children,
        ],
      };
      out.pop();
      const parts = wantsImage ? [target, figcaption] : [figcaption, target];
      out.push({
        type: 'figure',
        data: {
          hName: 'figure',
          hProperties: { id: caption.label, className: [wantsImage ? 'figure' : 'figure-table'] },
        },
        children: parts,
      });
    }
    tree.children = out;

    // Pass 2: resolve `#fig-…` / `#tbl-…` links anywhere in the document.
    walk(tree, (node) => {
      if (node.type !== 'link' || !/^#(?:fig|tbl)-/.test(node.url)) return;
      const label = node.url.slice(1);
      const hit = labels.get(label);
      if (!hit) fail(`Unresolved reference to #${label}: no caption defines {#${label}}`, node);
      if (node.children.length === 0) {
        node.children = [{ type: 'text', value: `${KINDS[hit.kind].word} ${hit.number}` }];
      }
    });
  };
}
