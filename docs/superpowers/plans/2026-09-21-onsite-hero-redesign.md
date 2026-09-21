# OnSite 三维场景生成首屏重设计 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有静态页面的首屏改造成接近参考图的浅色沉浸式 OnSite hero，同时保留所有现有导航、排行榜和成绩交互。

**Architecture:** 继续使用当前的静态模板 + CSS + 生成脚本架构。新增一张不含文字的 hero 位图，由 `src/page.html` 引用并在 `scripts/export-html.mjs` 构建时内嵌到 `index.html`；首屏结构和样式独立于下方排行榜及对话框逻辑。

**Tech Stack:** 原生 HTML、CSS、ES modules、Node.js 22+、内置 image generation 工具、现有静态 HTML 导出脚本。

## Global Constraints

- 保留 `public/onsite-logo.svg` 作为唯一品牌标志。
- 保留现有 `#overview`、`#leaderboard`、`#submit`、`#evaluation`、`#certificate` 锚点和成绩交互。
- Hero 高度在桌面端接近视口高度，移动端不产生横向溢出。
- Hero 图片不包含文字、logo 或水印；页面文字由 HTML 提供并保留可访问名称。
- 支持 `prefers-reduced-motion`，减少动画时关闭位移动画。

---

### Task 1: Add the light hero artwork

**Files:**
- Create: `public/scene-hero-light.png`

**Interfaces:**
- Produces: a wide raster background consumed by `src/page.html` as the hero image.

- [ ] **Step 1: Generate the project-bound artwork**

Use the built-in image generation tool with this brief:

```text
Use case: stylized-concept
Asset type: wide website hero background for an autonomous-driving research challenge
Primary request: an abstract, premium, high-key driving-world visual inspired by sweeping road ribbons and a futuristic mobility environment
Scene/backdrop: an expansive white and very light silver space with a smooth road-like horizon and layered curved motion bands
Subject: no people, no vehicles in close-up, no literal dashboard; the visual should read as a clean generated driving world
Style/medium: polished editorial 3D / architectural visualization, soft realistic materials, minimal and sophisticated
Composition/framing: 16:9 wide composition, generous pale negative space in the center for a black HTML headline, curves and motion detail concentrated toward the lower third and outer edges
Lighting/mood: bright diffuse daylight, calm, precise, optimistic, airy
Color palette: white, pearl gray, cool silver, faint powder blue and very subtle warm champagne highlights
Text (verbatim): none
Constraints: no text, no logos, no watermark, no UI, no dark foreground, no high-contrast object behind the center headline
Avoid: busy city details, readable signage, saturated colors, black areas, people, close-up cars, typography
```

- [ ] **Step 2: Inspect the generated image**

Confirm that the center remains quiet enough for the HTML title and that there is no generated text, logo, or watermark. If the center is too busy, regenerate once with stronger negative-space wording rather than compensating with a heavy overlay.

- [ ] **Step 3: Save the final asset in the workspace**

Copy the selected generated image to `public/scene-hero-light.png`, preserving the raster output and keeping the existing `public/scene-hero.png` unchanged.

### Task 2: Implement the immersive hero

**Files:**
- Modify: `src/page.html`
- Modify: `src/styles.css`
- Modify: `scripts/check-html.mjs`

**Interfaces:**
- Consumes: `/scene-hero-light.png` and `/onsite-logo.svg`.
- Produces: a semantic `.hero.hero--immersive` section with a centered title, a working `#leaderboard` CTA, and `.hero-scroll-cue`.

- [ ] **Step 1: Keep the test assertions red before implementation**

Run:

```text
npm.cmd test
```

Expected failure: `Hero must use the immersive first-screen treatment`, because the current generated page still has the old `.hero` structure.

- [ ] **Step 2: Update the hero markup**

Use the existing hero content but change the section to `class="hero hero--immersive"`, point the image to `/scene-hero-light.png`, use `alt="浅色抽象驾驶场景背景"`, and add:

```html
<div class="hero-meta" aria-hidden="true">
  <span>OnSite Challenge 2026</span>
  <span>Autonomous Driving / Generative World</span>
</div>
<div class="hero-copy">
  <p class="eyebrow">OnSite Challenge 2026</p>
  <h1 id="challenge-title">三维场景生成</h1>
  <p class="hero-english" lang="en">3D Scene Generation</p>
</div>
<a class="hero-link" href="#leaderboard">查看排行榜 <span aria-hidden="true">↗</span></a>
<a class="hero-scroll-cue" href="#overview"><span aria-hidden="true">↓</span><span>Scroll to explore</span></a>
```

Keep the existing skip link, semantic heading, logo link, and navigation targets intact.

- [ ] **Step 3: Style the full-bleed light hero**

Replace the old fixed 560px hero rules with a full-width, viewport-aware treatment:

```css
.hero--immersive {
  min-height: min(860px, calc(100svh - 104px));
  height: calc(100svh - 104px);
  width: 100%;
  max-width: none;
  margin: 0;
  color: #151918;
  background: #eef1f1;
}
.hero--immersive::after {
  background: linear-gradient(180deg, #ffffff1a 0%, #ffffff00 42%, #ffffffa6 100%);
}
.hero--immersive .hero-image {
  object-position: 50% 50%;
  animation: hero-drift 16s ease-out both;
}
.hero--immersive .hero-copy {
  inset: 50% auto auto 50%;
  transform: translate(-50%, -50%);
  width: min(760px, calc(100% - 48px));
  text-align: center;
}
.hero--immersive .hero h1 {
  color: #151918;
  font-size: clamp(52px, 8.5vw, 128px);
  letter-spacing: -.055em;
}
.hero--immersive .hero-english { color: #3f4846; }
.hero-meta, .hero-scroll-cue { position: absolute; color: #5e6966; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; }
.hero-meta { top: 32px; left: 48px; right: 48px; display: flex; justify-content: space-between; }
.hero-scroll-cue { left: 50%; bottom: 34px; transform: translateX(-50%); display: inline-flex; align-items: center; gap: 10px; }
.hero-scroll-cue span:first-child { display: grid; place-items: center; width: 28px; height: 28px; border: 1px solid #77817d; border-radius: 50%; font-size: 16px; }
@keyframes hero-drift { from { opacity: .82; transform: scale(1.035); } to { opacity: 1; transform: scale(1); } }
```

Also keep link/button transitions explicit, add a short `:active` scale for press feedback, and remove transform animation under `prefers-reduced-motion: reduce`.

- [ ] **Step 4: Build the standalone page**

Run:

```text
npm.cmd run build
```

Expected: `index.html` is regenerated with an embedded `data:image/png;base64,` hero asset and no external asset references.

### Task 3: Verify visual and functional behavior

**Files:**
- Modify: none
- Test: `scripts/check-html.mjs`, `scripts/check-browser.mjs`, generated `index.html`

**Interfaces:**
- Consumes: the built page from Task 2.
- Produces: passing static, data, and headless-browser verification.

- [ ] **Step 1: Run static and data tests**

Run:

```text
npm.cmd test
```

Expected: standalone HTML checks and result-data tests pass.

- [ ] **Step 2: Run the browser check**

Run:

```text
npm.cmd run test:browser
```

Expected: 1440px and 375px checks pass, with no JavaScript errors, no horizontal overflow, and a one-page certificate PDF.

- [ ] **Step 3: Inspect the generated page at both widths**

Open the generated page in a browser and confirm:

```text
document.querySelector('.hero.hero--immersive') !== null
document.querySelector('.hero-scroll-cue').getAttribute('href') === '#overview'
document.documentElement.scrollWidth <= window.innerWidth
```

Check that the OnSite logo is visible in the white header, the title is legible over the quiet center of the image, and clicking “查看排行榜” reaches the existing leaderboard.
