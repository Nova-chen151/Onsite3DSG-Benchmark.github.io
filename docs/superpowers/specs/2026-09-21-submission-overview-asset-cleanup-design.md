# Submission 总览图与封面资源清理设计

## 背景

用户提供的封面图与仓库现有的 `public/overview.png` 完全一致。页面当前在 `Submission` 区域没有展示这张图；首屏封面同时加载 MP4 和 GIF，且 `public/framework.png` 与已使用的 `public/astradrive-overview.png` 内容重复。

## 目标

- 在 `Submission` 区域的最后复用现有 `public/overview.png`，不复制新图片。
- 首屏封面只使用 MP4，移除 GIF poster、回退逻辑及其资源文件。
- 删除确认未使用或重复的 `public/framework.png`。
- 保持现有导航、排行榜、评测和成绩交互不变。
- 让 README、测试断言和生成后的独立 `index.html` 与资源实际状态一致。

## 技术方案

- 在 `src/page.html` 的 `#submit .section-body` 末尾增加 `figure.submission-figure`，引用 `/overview.png`，沿用 `overviewBenchmarkAlt` 本地化替代文本。
- 将 hero 的 `<video>` 保留为单一 MP4 source，移除 `poster` 与 `.hero-fallback` 图片。
- 删除 `src/styles.css` 中仅服务于 GIF 回退的 `.hero-fallback`、`.hero--video-fallback` 规则；删除 `src/app.js` 中的 hero error/loadeddata 回退处理，同时保留 reduced-motion 暂停行为。
- 更新 `scripts/check-html.mjs`，要求 MP4、Submission 图和 `submission-figure` 存在，同时断言 GIF 不再嵌入。
- 删除 GIF 与重复的 `framework.png`，并同步 README 的素材清单。

## 验收标准

1. `Submission` 最后一个内容元素是可访问的 `submission-figure`，显示 `overview.png`。
2. hero 保留 `data:video/mp4;base64,`，不再包含 `data:image/gif;base64,` 或 GIF 文件引用。
3. `public/drivearena_challenge_stacked.gif` 与 `public/framework.png` 不再存在，其他仍被页面/构建/许可证需要的文件保留。
4. `npm.cmd test` 与 `npm.cmd run test:browser` 通过，且页面无横向溢出。
