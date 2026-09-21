import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Script } from 'node:vm';
const html = await readFile('index.html', 'utf8');
assert.ok(html.startsWith('<!DOCTYPE html>'));
for (const id of ['overview', 'leaderboard', 'submit', 'evaluation']) {
  assert.ok(html.includes(`id="${id}"`), `Missing section: ${id}`);
  assert.ok(html.includes(`href="#${id}"`), `Missing navigation: ${id}`);
}
for (const label of ['QTES', 'FVD', 'CLIP-IQA+', 'DINO-T', 'Epi@3', 'TVC', 'TRS', 'RPDMS', 'Route Completion']) {
  assert.ok(html.includes(label), `Missing main-table metric: ${label}`);
}
for (const removed of ['class="metric-group', 'class="evaluation-framework"', 'class="evaluation-loop"', 'class="hero-caption"', 'class="view-labels"', 'class="study-note"', 'class="evaluation-figure"', 'class="references"', 'id="certificate"', 'Waymo Open Dataset', 'DrivingGen · Generative Driving Benchmark']) {
  assert.ok(!html.includes(removed), `Obsolete detailed element remains: ${removed}`);
}
assert.equal((html.match(/class="team-name"/g) || []).length, 6);
assert.equal((html.match(/data-sort="(?:rank|team|qtes|fvd|clipIqa|dinoT|epi3|tvc|trs|rpdms|routeCompletion)"/g) || []).length, 11, 'Every data column must be sortable');
assert.equal((html.match(/class="sort-indicator"/g) || []).length, 11, 'Every sortable header needs one reusable direction indicator');
assert.ok(html.includes('演示数据'));
assert.ok(!html.includes('AstraDrive'), 'Generated page must not contain AstraDrive branding');
assert.ok(!html.includes('astradrive-overview.png'), 'Generated page must not reference the AstraDrive overview asset');
assert.ok(html.includes('class="overview-figure"'), 'Overview must include the supplied framework graphic');
assert.ok(html.includes('frameworkOverviewAlt'), 'Framework graphic must have a localized accessible label');
assert.ok(html.includes('#evaluation {'), 'Evaluation section must define the QTES-to-footer spacing');
assert.ok(html.includes('padding-bottom: clamp('), 'Evaluation section must reserve responsive white space');
assert.ok(html.includes('class="hero hero--immersive"'), 'Hero must use the immersive first-screen treatment');
assert.ok(html.includes('class="hero-brand"'), 'Hero must include the OnSite brand mark');
assert.ok(html.includes('class="hero-video"'), 'Hero must use the supplied driving video');
assert.ok(html.includes('data:video/mp4;base64,'), 'Hero must embed the supplied MP4');
assert.ok(html.includes('class="submission-figure"'), 'Submission must end with the supplied overview graphic');
assert.ok(html.includes('data:image/png;base64,'), 'Submission overview graphic must be embedded');
assert.ok(!html.includes('data:image/gif;base64,'), 'Hero must not embed the removed GIF fallback');
assert.ok(!html.includes('drivearena_challenge_stacked.gif'), 'Generated HTML must not reference the removed GIF');
assert.ok(!html.includes('class="hero-fallback"'), 'Hero must not include the removed GIF fallback element');
assert.ok(html.includes('class="hero-scroll-cue"'), 'Hero must expose a scroll cue');
assert.ok(html.includes('3D Scenario Generation'), 'English copy must use scenario generation');
assert.ok(html.includes('data-i18n="navOverview"'), 'Page must expose localizable navigation copy');
assert.ok(html.includes('https://ipapi.co/json/'), 'Page must detect locale from the public IP');
assert.ok(html.includes('data:font/woff2;base64,'));
assert.ok(!/url\(['"]?\//.test(html), 'Unembedded CSS asset');
assert.ok(!/<(?:script|img|link)\b[^>]*(?:src|href)="(?!data:)[^"]+"/.test(html), 'External asset dependency');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
assert.equal(scripts.length, 1);
new Script(scripts[0][1]);
console.log('PASS: standalone HTML, navigation, six demo records, PDF main-table metrics, embedded assets and valid JavaScript.');
