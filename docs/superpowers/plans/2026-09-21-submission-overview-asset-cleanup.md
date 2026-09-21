# Submission 总览图与封面资源清理 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有总览图放到 `Submission` 末尾，并把首屏封面精简为单一 MP4，同时删除确认无用途的资源。

**Architecture:** 继续使用当前的原生 HTML/CSS/JavaScript 与 `scripts/export-html.mjs` 单文件导出架构。页面直接引用已存在的 `public/overview.png`；导出脚本会自动将所引用资源内嵌到 `index.html`，不新增构建依赖或组件层。

**Tech Stack:** 原生 HTML、CSS、ES modules、Node.js 22+、现有零依赖测试与 Puppeteer 浏览器检查。

## Global Constraints

- 不复制附件图；复用现有 `public/overview.png`。
- hero 只保留 `public/drivearena_challenge_stacked.mp4`，不保留 GIF fallback。
- 删除前先确认 `public/framework.png` 与 `public/astradrive-overview.png` 重复且无引用。
- 保留现有 `#overview`、`#leaderboard`、`#submit`、`#evaluation` 锚点与成绩交互。
- 不覆盖用户已有的 `index.html` 修改，构建时只在确认源文件变更后重新生成。

---

### Task 1: Update structural checks for the new asset policy

**Files:**
- Modify: `scripts/check-html.mjs`

**Interfaces:**
- Consumes: generated standalone `index.html`.
- Produces: assertions for MP4-only hero behavior and the final Submission figure.

- [ ] **Step 1: Replace GIF fallback assertions with MP4-only assertions**

Keep the existing MP4 assertion and add:

```js
assert.ok(html.includes('class="submission-figure"'), 'Submission must end with the supplied overview graphic');
assert.ok(html.includes('data:image/png;base64,'), 'Submission overview graphic must be embedded');
assert.ok(!html.includes('data:image/gif;base64,'), 'Hero must not embed the removed GIF fallback');
assert.ok(!html.includes('drivearena_challenge_stacked.gif'), 'Generated HTML must not reference the removed GIF');
assert.ok(!html.includes('class="hero-fallback"'), 'Hero must not include the removed GIF fallback element');
```

Remove the old assertions that require the embedded GIF or `.hero-fallback` alt text.

- [ ] **Step 2: Run the static test to verify the old generated page fails the new contract**

Run `npm.cmd run check:html`.

Expected: FAIL because the current generated `index.html` still includes the GIF fallback and does not include `submission-figure`.

### Task 2: Implement the Submission figure and MP4-only hero

**Files:**
- Modify: `src/page.html`
- Modify: `src/styles.css`
- Modify: `src/app.js`

**Interfaces:**
- Consumes: `/overview.png`, `/drivearena_challenge_stacked.mp4`, and existing locale key `overviewBenchmarkAlt`.
- Produces: one accessible `figure.submission-figure` at the end of `#submit`, a video-only hero, and no GIF fallback runtime path.

- [ ] **Step 1: Add the reused overview image at the end of Submission**

After the existing availability paragraph and before the closing `.section-body`, add:

```html
<figure class="submission-figure" tabindex="0">
  <img src="/overview.png" data-i18n-attr="alt:overviewBenchmarkAlt" alt="OnSite Challenge 2027 三维场景生成赛道：标准化初始场景、场景生成模型与选手提交结果" width="1975" height="537">
</figure>
```

- [ ] **Step 2: Remove GIF markup from the hero**

Keep only this video markup in `src/page.html`:

```html
<video class="hero-video" autoplay muted loop playsinline preload="auto" aria-hidden="true">
  <source src="/drivearena_challenge_stacked.mp4" type="video/mp4">
</video>
```

Remove the `.hero-fallback` `<img>` element entirely.

- [ ] **Step 3: Remove fallback-only CSS and JavaScript**

In `src/styles.css`, change selectors that group `.hero-video, .hero-fallback` to `.hero-video`, remove `.hero-fallback`, `.hero--video-fallback`, and the fallback object-position selector. Add:

```css
.submission-figure { width: 100%; margin-top: 34px; overflow: hidden; background: #f3f5f7; }
.submission-figure img { display: block; width: 100%; height: auto; }
.submission-figure:focus-visible { outline: 2px solid var(--blue); outline-offset: 5px; }
```

At the mobile breakpoint, set `.submission-figure { margin-top: 26px; }` alongside `.overview-figure`.

In `src/app.js`, remove the hero fallback event listeners and keep only:

```js
const heroVideo = document.querySelector('.hero-video');
if (heroVideo && globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) heroVideo.pause();
```

### Task 3: Remove redundant files and synchronize documentation

**Files:**
- Delete: `public/drivearena_challenge_stacked.gif`
- Delete: `public/framework.png`
- Modify: `README.md`

**Interfaces:**
- Consumes: the source references from Tasks 1–2.
- Produces: a `public/` directory containing only referenced runtime assets plus required license/documentation files.

- [ ] **Step 1: Verify the exact deletion targets**

Run:

```powershell
Get-FileHash public/astradrive-overview.png, public/framework.png
rg -n "framework\.png|drivearena_challenge_stacked\.gif" src scripts README.md
```

Expected: the two PNG hashes match, and the only GIF references are the hero references that Task 2 removes.

- [ ] **Step 2: Delete only the two confirmed redundant files**

Delete `public/drivearena_challenge_stacked.gif` and `public/framework.png`. Keep `overview.png`, `astradrive-overview.png`, logo files, fonts, and `FONT-LICENSES.txt`.

- [ ] **Step 3: Update README asset inventory**

Replace the DriveArena line with a single MP4 description, remove the stale `scene-hero.png` claim, and add `public/overview.png` as the image reused at the end of Submission. Remove the link to missing `public/IMAGE-PROMPTS.md`.

### Task 4: Build and verify the final standalone page

**Files:**
- Modify: `index.html` via `npm.cmd run build`
- Test: `scripts/check-html.mjs`, `scripts/results.test.mjs`, `scripts/locale.test.mjs`, `scripts/check-browser.mjs`

**Interfaces:**
- Consumes: the updated source and remaining `public/` assets.
- Produces: a standalone `index.html` with embedded MP4 and PNG assets and passing behavior checks.

- [ ] **Step 1: Regenerate the standalone page**

Run `npm.cmd run build`.

Expected: the build completes without missing-file errors and reports the standalone HTML size.

- [ ] **Step 2: Run all static and data tests**

Run `npm.cmd test`.

Expected: HTML, results, and locale checks all pass; generated HTML contains MP4 and PNG data URLs but no GIF data URL.

- [ ] **Step 3: Run the browser check**

Run `npm.cmd run test:browser`.

Expected: desktop and mobile checks pass with no JavaScript errors, no horizontal overflow, working navigation, and existing leaderboard/certificate interactions intact.

- [ ] **Step 4: Inspect the final diff and status**

Run:

```powershell
git status --short
git diff --stat
git diff --check
```

Confirm that only the planned source, test, README, generated `index.html`, two deletions, and planning documents changed; preserve unrelated pre-existing user changes.
