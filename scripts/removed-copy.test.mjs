import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { translations } from '../src/locale.js';
const removed = ['demoRecords', 'sortable', 'tableExplanation', 'demoNote', 'baseline', 'footerNote'];
for (const file of ['src/page.html', 'index.html']) {
  const html = await readFile(file, 'utf8');
  for (const key of removed) {
    assert.ok(!html.includes(`data-i18n="${key}"`), `Removed copy still present: ${file}: ${key}`);
  }
  assert.ok(!html.includes('class="table-foot"'), `Empty table foot must not remain: ${file}`);
  assert.ok(!html.includes('class="table-explanation"'), `Empty explanation must not remain: ${file}`);
  for (const key of ['leaderboardIntro', 'leaderboardCaption', 'footerTitle', 'footerTrack', 'availability']) {
    assert.ok(html.includes(`data-i18n="${key}"`), `Preserve unrelated content: ${key}`);
  }
}
for (const locale of ['zh', 'en']) {
  for (const key of removed) assert.ok(!Object.hasOwn(translations[locale], key), `Removed translation still present: ${locale}: ${key}`);
}
console.log('PASS: all six requested copy blocks and both language translations are absent; unrelated content is preserved.');
