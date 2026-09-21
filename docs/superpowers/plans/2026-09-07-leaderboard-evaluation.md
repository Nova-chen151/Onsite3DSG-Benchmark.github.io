# Large-Category Leaderboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the detailed leaderboard and HTML flow redraws with a concise large-category leaderboard and the two supplied PPT images.

**Architecture:** Keep the existing zero-dependency single-page build. Replace result fields at the data boundary, render a simple one-row table header, copy the two supplied PNGs into `public/`, and embed them into the standalone `index.html` through the existing exporter.

**Tech Stack:** HTML5, CSS, browser-native JavaScript, Node.js 22 scripts, Chrome DevTools Protocol checks.

## Global Constraints

- Preserve all existing user work outside the files named below.
- Keep the generated `index.html` fully standalone.
- Do not add dependencies or detailed metric columns.
- Keep the leaderboard demo-data disclosure and official-rule boundary.
- Preserve search, score sorting, CSV, PNG certificate, PDF printing, and responsive behavior.

---

### Task 1: Lock the revised page contract

**Files:**
- Modify: `scripts/check-html.mjs`
- Modify: `scripts/results.test.mjs`
- Modify: `scripts/check-browser.mjs`

**Interfaces:**
- Produces: tests for `visualScore`, `trajectoryScore`, `alignmentScore`, `agentScore`, `gateRate`, `submittedAt`, two image modules, and removed redraw/small-copy elements.

- [ ] Add structural assertions for the four large category labels, “基础门槛通过率”, “提交时间”, two `.evaluation-figure` elements, and absence of `.evaluation-framework`, `.evaluation-loop`, `.hero-caption`, `.view-labels`, and `.study-note`.
- [ ] Add data assertions requiring all six new fields, ranks 1–8, numeric gate rates between 0 and 100, and the new CSV labels.
- [ ] Run `npm run build` and `npm test`; verify failure because the revised contract is not implemented.

### Task 2: Implement the large-category leaderboard

**Files:**
- Modify: `src/page.html`
- Modify: `src/results.js`
- Modify: `src/app.js`
- Modify: `scripts/export-html.mjs`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `entries`, `csvFor(entry)`, `certificateSvg(entry)`.
- Produces: one-row leaderboard columns for total score, four large category scores, gate rate, submission time, and result action.

- [ ] Replace the detailed table header and explanatory copy with the large-category version.
- [ ] Replace detailed entry metrics with 0–100 category scores, percentage gate rate, submission timestamp, and a valid rank for every demonstration entry.
- [ ] Update row rendering, result summary, CSV output, and concise table styling.
- [ ] Run `npm run build` and `npm test`; verify the structural and data tests pass.

### Task 3: Replace redraws with PPT images and simplify captions

**Files:**
- Create: `public/evaluation-framework.png`
- Create: `public/evaluation-loop.png`
- Modify: `src/page.html`
- Modify: `src/styles.css`
- Modify: `README.md`

**Interfaces:**
- Consumes: the two PNG files supplied by the user from the project deck.
- Produces: two responsive `.evaluation-figure` containers whose images are embedded by `scripts/export-html.mjs`.

- [ ] Copy the supplied PPT images into `public/` without recompression.
- [ ] Replace the HTML redraw modules with two `<figure class="evaluation-figure">` blocks and accurate image alternative text.
- [ ] Remove the hero caption bar, multi-view direction labels, and AI note; delete obsolete redraw CSS.
- [ ] Update README asset documentation.
- [ ] Run `npm run build`, `npm test`, and `npm run test:browser` with the local Chrome executable.
- [ ] Inspect desktop and mobile renderings, then run `git diff --check` and review the changed-file list.

### Task 4: Add Waymo-style free column sorting

**Files:**
- Modify: `src/page.html`
- Modify: `src/results.js`
- Modify: `src/app.js`
- Modify: `src/styles.css`
- Modify: `scripts/results.test.mjs`
- Modify: `scripts/check-browser.mjs`

**Interfaces:**
- Produces: `sortEntries(items, key, direction)`, returning a copied array sorted by `rank`, `team`, a score field, `gateRate`, or `submittedAt` without changing each record's official `rank`.
- Produces: sortable header buttons for `rank`, `team`, `score`, `visualScore`, `trajectoryScore`, `alignmentScore`, `agentScore`, `gateRate`, and `submittedAt`.

- [x] **Step 1: Write failing unit and browser tests**

```js
assert.deepEqual(sortEntries(entries, 'gateRate', 'asc').map(e => e.rank), [8, 7, 6, 5, 4, 3, 2, 1]);
assert.equal(document.querySelectorAll('th[aria-sort]:not([aria-sort="none"])').length, 1);
```

- [x] **Step 2: Run the tests and verify the feature is missing**

Run: `npm run build; npm test`
Expected: FAIL because `sortEntries` and the nine sortable headers do not exist yet.

- [x] **Step 3: Implement the minimal sorting helper and header controls**

```js
export function sortEntries(items, key, direction) {
  const sign = direction === 'asc' ? 1 : -1;
  return [...items].sort((a, b) => sign * (key === 'team'
    ? `${a.team} ${a.model}`.localeCompare(`${b.team} ${b.model}`, 'zh-CN')
    : key === 'submittedAt'
      ? a.submittedAt.localeCompare(b.submittedAt)
      : a[key] - b[key]) || a.rank - b.rank);
}
```

Each sortable `<th>` contains a native `<button data-sort="field">`; only the active button has `.sorted` and a non-empty `.sort-indicator`. The active `<th>` uses `aria-sort="ascending"` or `aria-sort="descending"`; all others use `aria-sort="none"`.

- [x] **Step 4: Implement click behavior and active styling**

Start with `{ key: 'score', direction: 'desc' }`. Clicking the same header toggles direction. A newly selected `team` column starts ascending; every other newly selected column starts descending. Reorder existing `<tr>` elements and preserve their displayed official rank values. Style the active header with `var(--blue)` and white text.

- [x] **Step 5: Run complete verification**

Run: `npm run build; npm test`
Expected: PASS.

Run: `$env:CHROME_BIN = 'C:\Program Files\Google\Chrome\Application\chrome.exe'; npm run test:browser`
Expected: PASS at 1440px and 375px, including default state, descending/ascending toggles, team sorting, submission-time sorting, official-rank preservation, search, exports, and certificate printing.

- [x] **Step 6: Review final output**

Run: `git diff --check`
Expected: no whitespace errors. Inspect the leaderboard in Chrome at desktop and mobile widths and confirm inactive headers show no arrow while the active header is blue with one direction arrow.
