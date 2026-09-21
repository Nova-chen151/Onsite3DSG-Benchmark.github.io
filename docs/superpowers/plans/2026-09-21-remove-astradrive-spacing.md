# 去除 AstraDrive 标识与 QTES 后留白 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 从 active website source 中移除 AstraDrive 相关元素，并在最后一个 QTES 评测项与页脚之间增加白色留白。

**Architecture:** 保持当前静态模板、双语 locale、演示结果数据和单文件导出架构。品牌清理在源 HTML、locale、结果数据和证书/CSV 生成边界完成；CSS 只对 `#evaluation` 增加底部留白，导出脚本继续内嵌剩余资源。

**Tech Stack:** 原生 HTML、CSS、ES modules、Node.js 22+、现有静态检查与 Chrome DevTools Protocol 浏览器检查。

## Global Constraints

- 删除所有 active source 中的 `AstraDrive` 和 `astradrive-overview.png` 引用。
- 保留 QTES、FVD、CLIP-IQA+、DINO-T、Epi@3、TVC、TRS、RPDMS 和 Route Completion 指标及交互。
- 保留 `public/overview.png`、MP4 封面、排行榜、CSV、PNG 和 PDF 功能。
- `#evaluation` 的底部留白必须在桌面和移动端均可见，且不改变页脚自身的背景样式。
- 不覆盖用户已有的 README、index.html 或未跟踪 logo 改动；只更新本次需要的 AstraDrive 行。

---

### Task 1: Update failing checks for brand removal and spacing

**Files:**
- Modify: `scripts/check-html.mjs`
- Modify: `scripts/check-browser.mjs`

**Interfaces:**
- Consumes: generated `index.html` and the rendered DOM.
- Produces: regression checks for no AstraDrive content, no proprietary overview image, and QTES-to-footer spacing.

- [ ] **Step 1: Replace stale overview/brand assertions**

In `scripts/check-html.mjs`, replace the required `class="overview-figure"` and `AstraDrive` assertions with:

```js
assert.ok(!html.includes('AstraDrive'), 'Generated page must not contain AstraDrive branding');
assert.ok(!html.includes('astradrive-overview.png'), 'Generated page must not reference the AstraDrive overview asset');
assert.ok(!html.includes('class="overview-figure"'), 'AstraDrive overview figure must be removed');
assert.ok(html.includes('#evaluation {'), 'Evaluation section must define the QTES-to-footer spacing');
assert.ok(html.includes('padding-bottom: clamp('), 'Evaluation section must reserve responsive white space');
```

- [ ] **Step 2: Update browser assertions before implementation**

In `scripts/check-browser.mjs`, replace the required Overview image check with:

```js
check(!document.querySelector('.overview-figure'),'AstraDrive overview graphic removed');
check(parseFloat(getComputedStyle(document.querySelector('#evaluation')).paddingBottom) >= 70,'QTES leaves white space before footer');
```

- [ ] **Step 3: Run static checks and confirm the old generated page fails**

Run `npm.cmd test`.

Expected: FAIL because the current generated page still contains AstraDrive and the old Overview figure.

### Task 2: Remove AstraDrive from active page content and data

**Files:**
- Modify: `src/page.html`
- Modify: `src/locale.js`
- Modify: `src/results.js`
- Modify: `README.md`

**Interfaces:**
- Consumes: existing generic OnSite page structure, locale keys and demo result records.
- Produces: bilingual page content and result exports with no AstraDrive brand string.

- [ ] **Step 1: Remove the AstraDrive overview figure and replace visible page metadata**

In `src/page.html`:

- Set the meta description to `OnSite Challenge 2027 三维场景生成基准：赛道介绍、排行榜、参赛要求与四层评测办法。`.
- Set the title to `OnSite · 3D Scenario Generation 2027`.
- Remove the `figure.overview-figure` block that references `/astradrive-overview.png`.
- Change the board name/caption fallback text to `OnSite · 三维场景生成赛道` and `OnSite 三维场景生成基准演示排行榜，共六条记录，含九个主表指标`.
- Change footer fallback text to `三维场景生成赛道 · 2027` and `页面内容依据 OnSite Challenge 2027 赛事资料整理，正式参赛要求以赛事公告为准。`.

- [ ] **Step 2: Replace all locale strings containing AstraDrive**

In both `zh` and `en` translations, remove the brand from `pageTitle`, `pageDescription`, `overviewParagraph1`, `overviewBenchmarkAlt`, `leaderboardIntro`, `boardName`, `leaderboardCaption`, `baseline`, `footerTrack`, and `footerNote`. Use neutral wording such as `OnSite`, `the benchmark`, `参考生成基线`, and `the challenge materials` while preserving meaning and all existing locale keys.

- [ ] **Step 3: Remove AstraDrive from demo data and certificate translation**

In `src/results.js`:

- Change the file comments to describe generic demonstration fixtures.
- Change all six `team: 'AstraDrive baseline'` values to `team: 'Benchmark baseline'`.
- Change the English certificate replacement from `AstraDrive · 3D Scenario Generation Benchmark` to `OnSite · 3D Scenario Generation Benchmark`.

- [ ] **Step 4: Remove the deleted image link from README without touching unrelated user edits**

Delete only the README block linking to `public/astradrive-overview.png`; keep the generic `public/overview.png` block and all other user-authored content intact.

### Task 3: Add QTES-to-footer white space and remove the asset

**Files:**
- Modify: `src/styles.css`
- Delete: `public/astradrive-overview.png`

**Interfaces:**
- Consumes: the final evaluation section and active public assets.
- Produces: responsive white space after the QTES item and no AstraDrive-specific image file.

- [ ] **Step 1: Add responsive bottom spacing to the evaluation section**

Add to the main stylesheet:

```css
#evaluation { padding-bottom: clamp(86px, 9vw, 132px); }
```

Add the mobile override inside `@media (max-width: 760px)`:

```css
  #evaluation { padding-bottom: 72px; }
```

- [ ] **Step 2: Delete only the confirmed AstraDrive overview asset**

Run `git rm -- public/astradrive-overview.png` after source references are removed. Keep `public/overview.png`, the MP4, fonts, logos and license file.

### Task 4: Build and verify the cleaned page

**Files:**
- Modify: `index.html` via `npm.cmd run build`
- Test: `scripts/check-html.mjs`, `scripts/results.test.mjs`, `scripts/locale.test.mjs`, `scripts/check-browser.mjs`

**Interfaces:**
- Consumes: updated source, locale data and remaining public assets.
- Produces: a standalone page with no AstraDrive content and a visible QTES-to-footer gap.

- [ ] **Step 1: Regenerate the standalone page**

Run `npm.cmd run build`.

Expected: build succeeds without a missing-asset error.

- [ ] **Step 2: Run static and data tests**

Run `npm.cmd test`.

Expected: all HTML, results and locale checks pass, including the no-AstraDrive assertions.

- [ ] **Step 3: Run the browser checks at both viewports**

Run `$env:CHROME_BIN = 'C:\Program Files\Google\Chrome\Application\chrome.exe'; npm.cmd run test:browser`.

Expected: 1440px and 375px checks pass, QTES has at least 70px bottom padding, images load, sorting/export/certificate behavior remains intact, and the PDF remains one page.

- [ ] **Step 4: Audit active references and whitespace**

Run:

```powershell
rg -n -i "astradrive|astradrive-overview" src scripts README.md
git diff HEAD --check
git status --short
```

Expected: the first command returns no active-source matches, diff check has no whitespace errors, and the only AstraDrive deletion is the planned image file.
