# Changelog

本项目遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

## [0.1.0] - 2026-11-07

### 新增

- 内嵌「认知差写作宪法」技能（`ctx.skills.register`），平台无关：三问、文章骨架、措辞红线、排版硬规则、融合自检。
- `ip_studio_review` 工具：对草稿做确定性红线与排版终检（违禁词 / Markdown 表格残留 / 图片名 ASCII / 图数 / 标题与中文字数预算），返回结构化 blocker 与 warn；纯本地、零网络、零凭据。
- `ip_studio_format` 工具：Markdown → 各平台成品（公众号内联样式 HTML 并复用 `rich_pages wxw-img` 图片标签规范 / 知乎 / 小红书短笔记 / X thread / blog front-matter）；纯本地。
- `config/publish.example.json` 凭据模板与 `references/platform-adapters.md` 发布 adapter 契约：发布交由外部、用户自持脚本，插件不含密钥、无安装脚本。

### 安全

- 凭据一律外置，插件目录不携带任何真实密钥；无 postinstall / install 脚本、无外部二进制下载、不发起网络请求。
