# PITCH — dsh-ip-studio 引流素材包

面向 awesome-dsh-plugin 列表、DSH hub 收录、以及仓库"About"栏，复制即用。

## GitHub 仓库设置（一次配好）

**Topics**（About → 齿轮 → Topics，逐个输入）：
```
dsh-plugin
content-writing
personal-ip
wechat
marketing
ai-agent
```
> `dsh-plugin` 是生态检索主键，必加。

**Description**（About 栏，利于搜索命中）：
> 认知差内容工作室：把论文/素材整理成可发布的公众号/知乎/小红书/X 成稿，含红线终检与多平台排版工具。Perceptive-gap content studio for DeepSeek Harness.

**Social preview**（About → Social preview 上传）：可用一张 `ip_studio_format` 产出的公众号排版截图，提升点击率。

## awesome-dsh-plugin 列表提交（表格行，按名字排序插入）

```
| [dsh-ip-studio](https://github.com/CarryChang/dsh-ip-studio) | bundle · cordis | 认知差内容工作室：把论文/素材整理成可发布成稿，`ip_studio_review` 做红线+排版终检，`ip_studio_format` 出多平台成品（公众号/知乎/小红书/X/blog），发布走外部 adapter — Perceptive-gap content studio: material → publish-ready draft with deterministic review and multi-platform formatting | TS | 2026-11-07 |
```

## 一句话推荐语（issue / PR / 社区分享直接粘）

中文：
> dsh-ip-studio：把论文、素材、资讯整理成**可发布成稿**的个人 IP 内容引擎。一条 `dsh plugin --profile web add github:CarryChang/dsh-ip-studio` 即装即用（无需本地构建），零网络、零安装脚本、凭据外置。

English:
> dsh-ip-studio turns papers, notes and news into publish-ready personal-IP drafts. Install in one line (`dsh plugin --profile web add github:CarryChang/dsh-ip-studio`), no local build needed — zero network, zero install scripts, credentials kept outside the package.

## 作为独立 Agent Skill 推广（Agensi.io / Claude Code / Cursor / Copilot）

本插件的方法论与三个命令同时以开放 `SKILL.md` 格式打包在 `skills/dsh-ip-studio/`，不依赖 DeepSeek Harness，
一行拷入任意 agent 的技能目录即装即用（`outline` / `review` / `format` 由零依赖 Node CLI 提供）。面向 Agensi.io 这类
AI agent 技能市场，可直接把其中的技能单独收录；一句话：

> dsh-ip-studio 把论文/素材/资讯按认知差整理成可发布成稿，作为通用 Agent Skill 装进 Claude Code / Cursor / Copilot 等 20+ agent（`cp -r skills/dsh-ip-studio ~/.claude/skills/`），零网络、零凭据、零安装脚本。

## 能力矩阵（README/发帖配图用）

| 能力 | 载体 | 说明 |
|---|---|---|
| 认知差写作宪法 | `ip-studio` skill | 三问、文章骨架、措辞红线、排版硬规则、融合自检；平台无关 |
| 红线 + 排版终检 | `ip_studio_review` 工具 | 违禁词 / Markdown 表格残留 / 图片名 ASCII / 图数 / 标题与字数预算，返回 `{ findings, publishable }` |
| 多平台排版 | `ip_studio_format` 工具 | 公众号内联样式 HTML（复用 `rich_pages wxw-img`）/ 知乎 / 小红书 / X thread / blog front-matter |
| 发布 | 外部 adapter | 凭据外置，插件不联网、不调平台 API；个人订阅号只能建草稿，最终人工发布 |

## 首次上手演示脚本（录 GIF 或截图引流）

```text
建目录、放素材
→ 对模型说："用 ip-studio 把这篇论文按认知差整理成公众号稿"
→ 产出 xxx_ip.md
→ "跑 ip_studio_review 终检" → 修掉 blocker
→ "用 ip_studio_format 排成公众号 HTML" → 预览
```
