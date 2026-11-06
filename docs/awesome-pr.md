# awesome-dsh-plugin 收录 PR 模板

> 目标仓库：awesome-dsh-plugin（精选列表）。按其 CONTRIBUTING 三步走：① 仓库已打 `dsh-plugin` topic；② `package.json` 声明 `dsh.bundle`；③ 向合适的 category 文件加一行。下面是可直接粘贴的 PR 标题与正文。

## PR 标题

```
Add dsh-ip-studio — perceptive-gap content studio (writing skill + review/format tools)
```

## PR 正文

```markdown
### Plugin
[dsh-ip-studio](https://github.com/CarryChang/dsh-ip-studio)

### One-line description
中文：认知差内容工作室——把论文/素材整理成可发布成稿，含红线终检与多平台排版（公众号/知乎/小红书/X/blog）。
English: Perceptive-gap content studio — turn papers/notes/news into publish-ready drafts with deterministic red-line review and multi-platform formatting.

### Category
Suggest **Tools & Capabilities**（内容创作/排版工具向）。若你更希望归入内容/营销类目，也可放 Marketing/Content。

### Compliance checklist
- [x] Repo carries the `dsh-plugin` topic.
- [x] `package.json` declares `dsh.bundle.patch` → `cordis.patch.yml` (auto-detected as `bundle · cordis`).
- [x] Installable in one line, no local build needed (built `lib/` is committed):
      `dsh plugin --profile web add github:CarryChang/dsh-ip-studio`
- [x] Supply-chain safe: zero install scripts, no network calls from the plugin, credentials kept OUTSIDE the package (external adapter only).

### What it contributes
- A model/user-invocable **skill**: a platform-agnostic 认知差 (perceptive-gap) writing constitution.
- Two deterministic, offline tools: `ip_studio_review` (red-line + layout + figure-presence QC) and `ip_studio_format` (WeChat inline-style HTML with the `rich_pages wxw-img` convention, Zhihu/Xiaohongshu/X/blog).
- Drives DSH's own multimodal capabilities for 图文混排 (extract PDF figures, render tables to images, self-draw concept diagrams); a text-only draft is blocked by the review tool.

### License
MIT. Author: 实用AI.
```
