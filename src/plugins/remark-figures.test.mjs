import { test } from 'node:test';
import assert from 'node:assert/strict';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkFigures from './remark-figures.mjs';

const render = (md) =>
  unified().use(remarkParse).use(remarkGfm).use(remarkFigures).use(remarkRehype).use(rehypeStringify)
    .process(md).then(String);

test('figure, table, caption, and references', async () => {
  const html = await render(`
Intro, see [](#fig-a) and [](#tbl-t).

![Alt text](a.png)

Figure: A *caption*. {#fig-a}

| x | y |
|---|---|
| 1 | 2 |

Table: Counts. {#tbl-t}
`);
  assert.match(html, /<figure id="fig-a" class="figure"><p><img src="a.png" alt="Alt text"><\/p>\s*<figcaption><strong class="fig-label">Figure 1\.<\/strong> A <em>caption<\/em>\.<\/figcaption><\/figure>/);
  assert.match(html, /<figure id="tbl-t" class="figure-table"><figcaption>.*Table 1\..*<\/figcaption>\s*<table>/s);
  assert.match(html, /<a href="#fig-a">Figure 1<\/a>/);
  assert.match(html, /<a href="#tbl-t">Table 1<\/a>/);
});

test('uncaptioned images and tables are untouched', async () => {
  const html = await render('![x](a.png)\n\n| a |\n|---|\n| 1 |\n');
  assert.doesNotMatch(html, /<figure/);
});

test('duplicate labels fail', async () => {
  await assert.rejects(render('![a](a.png)\n\nFigure: One. {#fig-a}\n\n![b](b.png)\n\nFigure: Two. {#fig-a}\n'), /Duplicate label \{#fig-a\}/);
});

test('unresolved references fail', async () => {
  await assert.rejects(render('See [](#fig-missing).\n'), /Unresolved reference to #fig-missing/);
});

test('orphaned captions fail', async () => {
  await assert.rejects(render('Just text.\n\nFigure: Nothing above. {#fig-a}\n'), /must directly follow an image/);
  await assert.rejects(render('![a](a.png)\n\nTable: Wrong kind. {#tbl-a}\n'), /must directly follow a table/);
});

test('mismatched label prefix fails', async () => {
  await assert.rejects(render('![a](a.png)\n\nFigure: Wrong. {#tbl-a}\n'), /expected a \{#fig-…\} label/);
});
