import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile('src/styles.css', 'utf8');
const html = await readFile('index.html', 'utf8');
const embeddedCss = html.match(/<style>([\s\S]*?)<\/style>/)?.[1];
assert.ok(embeddedCss, 'The published page must contain its CSS');
for (const [name, text] of [['source', css], ['published', embeddedCss]]) {
  let count = 0;
  for (const [, selector, declarations] of text.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!selector.includes('.leaderboard-table')) continue;
    for (const [, value] of declarations.matchAll(/\bbackground(?:-color|-image)?\s*:\s*([^;}]+)/g)) {
      count++;
      assert.ok(['transparent', 'none', 'white', '#fff', '#ffffff'].includes(value.trim()),
        `Table background must be unfilled (${name}): ${selector.trim()} -> ${value}`);
    }
  }
  assert.ok(count >= 5, 'Background checks must include normal, active, hover and best-result rules');
}
for (const path of ['src/page.html', 'src/locale.js', 'index.html']) {
  const text = await readFile(path, 'utf8');
  assert.doesNotMatch(text, /珊瑚色和蓝色|Coral and blue indicate/, 'Removed color legend must not remain');
}
assert.match(css, /td\.metric-best\s*\{[^}]*font-weight:\s*400/, 'Best results must use regular text');
console.log('PASS: source and published table have no colored fills, including active and hover states; localized legends match.');
