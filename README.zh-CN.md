# dsh-ip-studio｜IP 内容工作室（认知差写作）

[English](./README.md) | **简体中文**

把论文、素材、资讯整理成**可发布成稿**的个人 IP 内容引擎，作为 DeepSeek Harness（DSH）插件分发。
它不是绑死单一账号的脚本流水线，而是「一份可复用的认知差写作方法论 + 两个确定性工具 + 外置发布 adapter」。

[![npm](https://img.shields.io/npm/v/dsh-ip-studio.svg)](https://www.npmjs.com/package/dsh-ip-studio)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)
[![Topic: dsh-plugin](https://img.shields.io/badge/ecosystem-dsh--plugin-purple.svg)](https://github.com/topics/dsh-plugin)

## 为什么做这个插件

在 DSH 插件生态里，做通知桥接、微信读书、通用"内容生成"的很多，但**没有一个聚焦"认知差写作 + 多平台成稿/草稿"**；
而外部 content / writing / marketing 是最热的付费品类。本插件填补这个空位，并把最难复制的资产——那套
「认知差写作宪法」——留住，把最脆弱的平台胶水降级成可插拔、凭据分离、零安装脚本的外部 adapter。

## 组成（两者结合）

- **Skill 层**：`ctx.skills.register(...)` 内嵌平台无关的认知差写作宪法（三问、文章骨架、措辞红线、排版硬规则、融合自检），标识 `ip-studio`，model 与 user 皆可调用；同时随包提供 [`SKILL.md`](./SKILL.md)。
- **工具层（纯本地、确定性）**：
  - `ip_studio_review`：草稿红线与排版终检（违禁词 / Markdown 表格残留 / 图片名 ASCII / 图数 / 标题与中文字数预算），返回 `{ findings, publishable }`。
  - `ip_studio_format`：Markdown → 公众号内联样式 HTML（复用 `rich_pages wxw-img` 图片标签规范）/ 知乎 / 小红书 / X thread / blog front-matter，返回 `{ content, notes }`。
- **发布层（不内置）**：见 [`references/platform-adapters.md`](./references/platform-adapters.md)。凭据走 [`config/publish.example.json`](./config/publish.example.json) 模板 + 外部路径注入；调用平台 API 由用户自持脚本完成。

## 安装

前提：已安装 `dsh` CLI，且目标 profile（如 `web`）已初始化。

```sh
# A) 从 npm 装进 profile
dsh plugin --profile web add dsh-ip-studio

# B) 从 Git 装
dsh plugin --profile web add github:CarryChang/dsh-ip-studio

# C) 本地开发：克隆后以 link 安装
git clone https://github.com/CarryChang/dsh-ip-studio.git
cd dsh-ip-studio && pnpm install && pnpm run build
dsh plugin --profile web add link:.
```

装完后插件的 `cordis.patch.yml` 层会自动进入 profile 配置栈。验证：

```sh
dsh --profile web --dump-config | grep ip-studio   # 应看到 “# == dsh-ip-studio” 一节
```

启动 profile 后若日志无 `ip-studio ... failed to import` / `did not activate`，即注册成功。
改 `src/*.ts` 后需重新 `pnpm run build` 并重启（加载的是 `lib/` 产物）。

## 用法

对模型说：「用 `ip-studio` 把这篇论文按认知差整理成公众号稿」→ 它会先出成稿，
再用 `ip_studio_review` 终检、`ip_studio_format` 排版。默认停在成稿，只有你明确要「发/建草稿」才走发布。

## 安全边界

- 无 postinstall / install 脚本、无外部二进制下载、不发起网络请求。
- 不含任何密钥；凭据只存在于用户本机的外部配置文件。
- 发布永远是人工确认的一步（个人订阅号 API 也不能直发，只能建草稿）。

## 发布 / 收录

本包已按 `github.com/CarryChang/dsh-ip-studio` 配置好。若你 fork，请把 `repository`/`homepage`/`bugs`
与文档里的归属改成你自己的，`pnpm run check` 通过后 `npm publish`（`prepack` 会自动重建 `lib`）。
给 DSH hub 收录见 [`docs/hub-registration.md`](./docs/hub-registration.md)，并给仓库打上 `dsh-plugin` topic。

## 许可

MIT — 见 [LICENSE](LICENSE)。版本记录见 [CHANGELOG.md](CHANGELOG.md)。
