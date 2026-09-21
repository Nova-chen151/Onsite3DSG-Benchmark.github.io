# OnSite Challenge 2027 · AstraDrive 三维场景生成基准

直接双击 `index.html` 即可离线使用。图像、CSS 与 JavaScript 均内嵌；无需安装依赖、启动服务或连接 CDN。

页面使用原生 HTML/CSS/JavaScript，包含榜单排序、行记录、CSV 成绩导出、PNG 电子证明及单页 A4 横向 PDF 打印。弹窗使用浏览器原生 `dialog`，支持键盘操作、Escape 关闭与焦点返回。

排行榜按照 PDF 主表呈现九个核心分项指标：QTES、FVD、CLIP-IQA+、DINO-T、Epi@3、TVC、TRS、RPDMS 和 Route Completion；“评测办法”按四个一级模块说明这些分项指标。

## 修改与生成

- `src/page.html`：页面内容与布局。
- `src/styles.css`：字体、排版、响应式与打印样式。
- `src/app.js`：交互；`src/results.js`：演示数据、CSV 与证书模板。
- `public/`：原始图像和品牌素材。
- `scripts/`：零依赖生成与验证脚本。

使用 Node.js 22 或更高版本，无需 `npm install`：

```sh
npm run build
npm test
npm run test:browser
```

浏览器检查需要安装 Chrome，非默认路径可设置 `CHROME_BIN`。检查覆盖 1440px / 375px 布局、图像、导航、主表指标排序、CSV、PNG、记录限制及单页 PDF 打印。

当前机器可用的 Node.js 在 `/home/yuhang/miniconda3/envs/codex-cli/bin`；如果默认版本过旧，先执行：

```sh
export PATH=/home/yuhang/miniconda3/envs/codex-cli/bin:$PATH
```

## 设计与素材来源

版式参考 [Waymo Sim Agents 2025](https://waymo.com/open/challenges/2025/sim-agents/) 的图像主视觉、疏朗排版与连续赛事页面。保留 OnSite 正式标志，以黑白与少量品牌蓝为主色。

赛道内容依据 `C:/Users/51523/Desktop/ICLR-2027/iclr2027_conference.pdf`：AstraDrive 论文定义任务、六个生成基线、四个一级评测指标与策略评测流程。

- `public/onsite-logo.svg`：原样提取自 `ppt/media/image9.svg`，未重绘品牌。
- `public/drivearena_challenge_stacked.mp4`、`public/drivearena_challenge_stacked.gif`：DriveArena 多视角驾驶视频与 GIF 回退，用作首屏封面；`public/scene-hero.png` 保留为原始封面素材。
- `public/astradrive-overview.png`：用户提供的 AstraDrive 任务与评测总览图，整幅铺满 Overview 内容区。
- [完整生成提示词与素材路径](public/IMAGE-PROMPTS.md)。
- `public/editorial-serif.woff2`、`public/editorial-italic.woff2`：从本机 Noto Serif CJK SC 与 Liberation Serif Italic 制作的页面字形子集，分别用于中文艺术标题与英文斜体标题；字体内嵌于 HTML，许可证见 `public/FONT-LICENSES.txt`。榜单与正文保持无衬线字体。

字体子集覆盖当前页面文字。将来增加新的艺术标题用字时，可用 fontTools 的 `pyftsubset` 从原字体重新生成子集；普通页面构建不需要 fontTools。
- `public/favicon.svg`：保留的站点图标。

## 数据边界

全部队伍、模型和分数为虚构演示数据，不代表正式赛事结果。未通过门槛的记录不入榜、不能生成电子证明；CSV 与证书保留演示性质、记录编号和成绩日期。正式上线需接入赛事审批后的成绩、身份验证及证书签发机制。当前页面不包含提交后台。
