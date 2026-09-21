# 去除 AstraDrive 标识与 QTES 后留白设计

## 目标

- 从页面实际内容、双语文案、排行榜演示数据、证书/CSV 文案和说明文档中移除 AstraDrive 标识。
- 删除专属的 `public/astradrive-overview.png` 资源及其页面引用。
- 保留通用的三维场景生成、QTES 及其他评测指标、排行榜和导出交互。
- 在最后一个 QTES 评测项之后到页脚之间增加明确的白色留白。

## 方案

- 用 OnSite/通用 benchmark 文案替换 active source 中的 AstraDrive 字符串；演示队伍统一改为通用的 `Benchmark baseline`。
- 移除 Overview 中依赖 AstraDrive 图片的 figure；Submission 继续使用不含 AstraDrive 标识的现有 `overview.png`。
- 为 `#evaluation` 增加响应式 `padding-bottom`，桌面端留白大于移动端，页脚仍保持独立背景区域。
- 更新 standalone HTML 检查和浏览器检查，保证生成页不含 AstraDrive，专属图片不存在，并验证 QTES 后留白。

## 验收标准

1. `src/`、生成后的 `index.html` 和 README 不再出现 `AstraDrive` 或 `astradrive-overview.png`。
2. `public/astradrive-overview.png` 被删除；通用 `overview.png` 与 MP4 封面保持可用。
3. QTES 评测区与页脚之间在桌面、移动视口均有可见白色留白。
4. `npm.cmd run build`、`npm.cmd test` 和 Chrome 浏览器检查通过。
