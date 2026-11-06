# Changelog

本项目遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

## [0.4.0] - 2026-11-07

### 新增

- `ip_studio_format`（公众号）输出包一层完整样式容器 `<section>`（统一字体/行高/断词），整段粘贴更稳定。
- `ip_studio_review` 新增 `figures-clustered`（warn）：多张图全集中在正文前部时提醒“真·图文混排”应把图挨到各自论断旁。

## [0.3.0] - 2026-11-07

### 新增

- `ip_studio_format`（公众号）排版专业化：图片与其后的斜体图注自动归组为 `<figure>/<figcaption>`（图注灰显居中）；支持有序列表 `<ol>`、`---` 分隔线、行内代码 `<code>`。
- `ip_studio_review` 新增专业度结构检查（warn）：`missing-framework`（缺可带走框架）、`missing-caveats`（缺分析师式追问）、`flat-title`（「XX解读」式流水账标题）、`no-bold-lead`（首段未摊核心判断）。

## [0.2.0] - 2026-11-07

### 新增

- 方法论补充「多模态读图」与「配图工程/知识可视化」两个阶段：驱动视觉模型解读 PDF 原图、数据表转 PNG、为核心框架自绘概念/流程/分层示意图、图文混排与封面。
- `ip_studio_review` 新增可视化拦截：`no-figures`（无配图；公众号 blocker、知乎/blog warn）与 `figure-caption-coverage`（图注覆盖率）。

### 变更

- 明确成稿必须图文混排：纯文字稿不再合格，会被 review 拦下。

## [0.1.0] - 2026-11-07

### 新增

- 内嵌「认知差写作宪法」技能（`ctx.skills.register`），平台无关：三问、文章骨架、措辞红线、排版硬规则、融合自检。
- `ip_studio_review` 工具：对草稿做确定性红线与排版终检（违禁词 / Markdown 表格残留 / 图片名 ASCII / 图数 / 标题与中文字数预算），返回结构化 blocker 与 warn；纯本地、零网络、零凭据。
- `ip_studio_format` 工具：Markdown → 各平台成品（公众号内联样式 HTML 并复用 `rich_pages wxw-img` 图片标签规范 / 知乎 / 小红书短笔记 / X thread / blog front-matter）；纯本地。
- `config/publish.example.json` 凭据模板与 `references/platform-adapters.md` 发布 adapter 契约：发布交由外部、用户自持脚本，插件不含密钥、无安装脚本。

### 安全

- 凭据一律外置，插件目录不携带任何真实密钥；无 postinstall / install 脚本、无外部二进制下载、不发起网络请求。
