import assert from 'node:assert/strict';
import { entries, sortEntries, csvFor, certificateSvg, certificateSvgForLocale } from '../src/results.js';
assert.equal(new Set(entries.map((e) => e.id)).size, entries.length);
const ranked = entries.filter((e) => e.valid);
assert.deepEqual(
  ranked.map((e) => e.rank),
  [1, 2, 3, 4, 5, 6],
);
assert.ok(ranked.every((e, i) => i === 0 || ranked[i - 1].score >= e.score));
assert.deepEqual(sortEntries(entries, 'score', 'desc').map(e => e.rank), [1, 2, 3, 4, 5, 6]);
assert.deepEqual(sortEntries(entries, 'qtes', 'asc').map(e => e.rank), [6, 5, 4, 3, 2, 1]);
assert.deepEqual(sortEntries(entries, 'rank', 'desc').map(e => e.rank), [6, 5, 4, 3, 2, 1]);
assert.deepEqual(sortEntries(entries, 'submittedAt', 'asc').map(e => e.rank), [6, 5, 4, 3, 2, 1]);
assert.equal(sortEntries(entries, 'team', 'asc')[0].model, 'DreamForge');
assert.deepEqual(entries.map(e => e.rank), [1, 2, 3, 4, 5, 6], 'sorting must not mutate official ranks or source order');
for (const entry of entries) {
  for (const field of ['qtes', 'fvd', 'clipIqa', 'dinoT', 'epi3', 'tvc', 'trs', 'rpdms', 'routeCompletion']) {
    assert.equal(typeof entry[field], 'number', `${field} must be numeric`);
  }
  assert.ok(entry.qtes > 0 && entry.qtes <= 100);
  assert.match(entry.submittedAt, /^2026-\d{2}-\d{2} \d{2}:\d{2}$/);
}
const csv = csvFor(entries[0]);
assert.ok(csv.startsWith('\uFEFF'));
assert.ok(csv.includes('78.42') && csv.includes('演示成绩'));
for (const label of ['QTES', 'FVD', 'CLIP-IQA+', 'DINO-T', 'Epi@3', 'TVC', 'TRS', 'RPDMS', '路线完成度']) assert.ok(csv.includes(label));
const englishCsv = csvFor(entries[0], 'en');
assert.ok(englishCsv.includes('QTES') && englishCsv.includes('Route Completion'));
assert.ok(
  csvFor({ ...entries[0], team: '=FORMULA,"test"' }).includes("'=FORMULA,"),
);
const svg = certificateSvg({ ...entries[0], team: '<script>&"' });
assert.ok(svg.includes('&lt;script&gt;&amp;&quot;'));
assert.ok(
  svg.includes('DEMO-001') &&
    svg.includes('2026-09-06') &&
    svg.includes('不作为官方成绩'),
);
assert.ok(certificateSvg(entries[5]).includes('#6'));
const englishSvg = certificateSvgForLocale(entries[0], 'en');
assert.ok(englishSvg.includes('Certificate of Achievement'));
assert.ok(englishSvg.includes('3D Scenario Generation'));
assert.ok(!englishSvg.includes('电子成绩证明'));
console.log(
  'PASS: ranking, CSV export, CSV escaping, certificate identity, XML escaping and eligibility.',
);
