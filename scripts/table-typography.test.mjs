import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const css = await readFile('src/styles.css', 'utf8');
const html = await readFile('index.html', 'utf8');
const embeddedCss = html.match(/<style>([\s\S]*?)<\/style>/)?.[1];
assert.ok(embeddedCss);
for (const [name, text] of [['source', css], ['published', embeddedCss]]) {
  let checked = 0;
  for (const [, selector, declarations] of text.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!selector.includes('.leaderboard-table') && !selector.includes('.sort-indicator')) continue;
    for (const [, value] of declarations.matchAll(/\bfont-weight\s*:\s*([^;}]+)/g)) {
      checked++;
      assert.ok(['400', 'normal', 'inherit'].includes(value.trim()),
        `Leaderboard text must use normal weight (${name}): ${selector.trim()} -> ${value}`);
    }
  }
  assert.ok(checked >= 5, 'Check headers, sort arrows, QTES and best values');
}
for (const path of ['src/page.html', 'src/locale.js', 'index.html']) {
  assert.doesNotMatch(await readFile(path, 'utf8'), /单项最优以粗体标注|shown in bold/,
    'Removed bold legend must not remain');
}
console.log('PASS: leaderboard uses regular-weight text in source and built page.');
