# Changelog

本项目遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

## [0.7.1] - 2026-11-07

### 变更

- 公众号正文图片标签改为写入 `src`（不再用编辑器专用的 `data-src`），`class="rich_pages wxw-img"` 保留。这样本地直接打开生成的 HTML 时图片能正常渲染预览，不再是空白占位；上传拿到 CDN 地址与真实宽高仍由 adapter 回填。

## [0.7.0] - 2026-11-07

### 新增

- 第三个工具 `ip_studio_outline`：从抽取的素材正文确定性生成认知差七段式骨架，用正则预取硬数字、被推翻假设候选、Figure/Table 线索、小节标题填入空槽，供 agent 填判断与可带走框架；纯本地、零依赖、不联网。方法论与 SKILL 已标注“动笔前先跑”。

## [0.6.2] - 2026-11-07

### 文档

- `references/platform-adapters.md` 新增“安装配图用可选 Python 依赖（国内加速）”：`pymupdf`/`Pillow` 走清华镜像 `pypi.tuna.tsinghua.edu.cn`，并建议先探测再装、优先用已内置这些库的解释器；SKILL.md 加了指针。

## [0.6.1] - 2026-11-07

### 修复

- 修复启动时报 `SyntaxError: Missing initializer in const declaration` / `ip-studio failed to import`：`methodology.ts` 的 SKILL_BODY 模板字符串被新增行里的反引号提前终止，现去除该反引号。
- 防回归：冒烟脚本现在强制 import methodology（模板字符串再被截断会当场报错）。

## [0.6.0] - 2026-11-07

### 新增

- `ip_studio_format` 自动修复：缺图注的配图在正文注入占位图注（`图 N（图注待补…）`）并生成 fix；图名不合规范（空格/`%`/中文/URL 编码）时输出建议的 ASCII 改名（`fig1.png`）；所有平台的 `notes` 汇总这些修复。
- 可切换主题：新增 `Brand` 调色（name/accent/accentSoft/text/muted，对齐 `config/publish.example.json`）与 `DEFAULT_BRAND`；公众号 HTML 按主题着色，小红书/blog 注入品牌名。`ip_studio_format` 接受可选 `brand` 入参覆盖默认。

### 变更

- `FormattedOutput.notes` 现在除排版提示外，还包含逐图的图注/命名修复建议。

## [0.5.0] - 2026-11-07

### 新增

- 全平台图文混排兼容：小红书不再丢图，输出“正文要点 + 按序配图清单（含中文图注）”；X thread 把每张图当一条 `📎 配图` 媒体推文保留。
- `FormattedOutput` 新增 `images` 字段：每个平台都返回按序的本地图清单，供 adapter 统一上传。

### 变更

- `ip_studio_format` 返回形状改为 `{ content, images, notes }`。

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
