# hub 收录登记建议（供 hub 维护者 triage 时复制）

DSH hub 不接受 PR：插件仓库由 hub 的同步循环 + 管理员 triage 收录。本文件是给维护者的**登记建议**，
当同步循环把 `dsh-ip-studio` 标记为「未分类」时，直接复制下面两段即可。

前置条件：
- 仓库已公开，并打上 topics（GitHub 只收小写字母/数字/连字符）：`dsh`、`dsh-plugin`、`agent-skill`、`content-writing`、`writing`、`content-creation`、`personal-ip`、`personal-brand`、`self-media`、`perceptive-gap`、`wechat`、`zhihu`、`xiaohongshu`、`marketing`、`ai-agent`、`claude-code`。
- `package.json` 声明了 `dsh.bundle.patch`（`cordis.patch.yml`）→ 管理面板自动推导为 `bundle · cordis`，无需人工覆盖。
- `package.json` 带中文简介（中英双语 `description`）、`homepage`、以及上述 `keywords`；`locale/{zh,en}.json` 的 `meta.description` 为双语展示文案。生成器以 `package.json` + locale 文件为索引数据源。

## catalog.source.json（repos 数组追加一行）

```json
    { "name": "dsh-ip-studio", "category": "plugin", "tags": ["content-writing", "personal-ip", "wechat", "marketing"], "note": "认知差内容工作室：内嵌平台无关的认知差写作宪法 skill + 两个确定性工具（ip_studio_review 红线/排版终检、ip_studio_format 多平台排版）；发布交由外部、用户自持 adapter，插件不含密钥、零安装脚本" }
```

## README.md（插件表格，按名字排序插入）

```
| [dsh-ip-studio](https://github.com/CarryChang/dsh-ip-studio) | bundle · cordis | 认知差内容工作室：把论文/素材整理成可发布成稿，`ip_studio_review` 终检 + `ip_studio_format` 多平台排版（公众号/知乎/小红书/X/blog），发布走外部 adapter — Perceptive-gap content studio: material → publish-ready draft with deterministic review and multi-platform formatting | TS | 2026-11-07 |
```

> 本仓库归属为 CarryChang；若 fork 给其他作者，需把上面两段的 URL 与 `package.json` 的 `repository`/`homepage`/`bugs` 一并改掉。
