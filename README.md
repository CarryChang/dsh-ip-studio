# dsh-ip-studio — IP Content Studio (perceptive-gap writing)

**English** | [简体中文](./README.zh-CN.md)

Turn papers, notes and news into **publish-ready drafts** that build a personal IP, distributed as a
[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (`dsh`) plugin. It is not an
account-coupled script pipeline: it keeps the hard-to-copy asset — a perceptive-gap (认知差) writing
methodology — and turns the fragile platform glue into pluggable, credential-separated external adapters.

[![Install from GitHub](https://img.shields.io/badge/dsh%20plugin%20add-github-4F46E5.svg)](#install)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)
[![Topic: dsh-plugin](https://img.shields.io/badge/ecosystem-dsh--plugin-purple.svg)](https://github.com/topics/dsh-plugin)

## Why

Across the DSH plugin ecosystem there are notification bridges, WeChat-Reading tools and generic
"content generation" bundles, but **nothing focused on perceptive-gap writing plus multi-platform
drafts** — while content / writing / marketing is the largest external paid category. This plugin fills
that gap and, unlike a WeChat-only pipeline, stays safe to distribute: zero install scripts, credentials
kept outside the package.

## What it is (skill + tools)

- **Skill layer** — the perceptive-gap writing constitution is embedded via `ctx.skills.register(...)`
  (name `ip-studio`, model- and user-invocable) and shipped as [`SKILL.md`](./SKILL.md): three questions,
  article skeleton, wording red lines, hard layout rules, merge-and-self-check.
- **Tool layer (offline, deterministic)**:
  - `ip_studio_review` — red-line and layout QC of a draft (banned wording, Markdown tables WeChat will not
    render, non-ASCII image names, image count, title and Chinese-length budget). Returns `{ findings, publishable }`.
  - `ip_studio_format` — Markdown to per-channel output: WeChat inline-style HTML (using the
    `rich_pages wxw-img` image-tag convention), Zhihu, Xiaohongshu, X thread split, blog front-matter.
    Returns `{ content, notes }`.
- **Publishing layer (not bundled)** — see [`references/platform-adapters.md`](./references/platform-adapters.md).
  Credentials come from the [`config/publish.example.json`](./config/publish.example.json) template via an
  external path; the actual platform API call is a user-owned script.
- **Portable Agent Skill** — the same skill + the three commands packaged under
  [`skills/dsh-ip-studio/`](./skills/dsh-ip-studio) so they install into Claude Code / Cursor / Copilot
  with no DeepSeek Harness (see [Use as a standalone agent skill](#use-as-a-standalone-agent-skill-no-deepseek-harness)).

## Install

Requires the `dsh` CLI and an initialized profile (for example `web`).

```sh
# Recommended — install straight from GitHub (lib/ is committed, no build on your side):
dsh plugin --profile web add github:CarryChang/dsh-ip-studio

# Or from a local clone during development:
git clone https://github.com/CarryChang/dsh-ip-studio.git
cd dsh-ip-studio && pnpm install && pnpm run build
dsh plugin --profile web add link:.
```

> npm publish is planned; once live, `dsh plugin --profile web add dsh-ip-studio` will also work.

The plugin's `cordis.patch.yml` layer joins the profile's config stack automatically. Verify:

```sh
dsh --profile web --dump-config | grep ip-studio   # expect a “# == dsh-ip-studio” section
```

After boot, the absence of `ip-studio ... failed to import` / `did not activate` means registration
succeeded. Profiles load the built `lib/`, so re-run `pnpm run build` and restart after editing `src/*.ts`.

## Use as a standalone agent skill (no DeepSeek Harness)

The methodology and the three deterministic commands also ship as a portable
[Agent Skill](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview) under
[`skills/dsh-ip-studio/`](./skills/dsh-ip-studio) — the open `SKILL.md` format that installs into
Claude Code, Cursor, Copilot and 20+ other agents (and is what marketplaces such as Agensi.io list).
It runs the same `outline` / `review` / `format` logic through a dependency-free Node CLI, so it works
without `dsh`. Copy the folder into your agent's skills directory:

```sh
# Claude Code (user-level):
cp -r skills/dsh-ip-studio ~/.claude/skills/
# or project-level: .claude/skills/dsh-ip-studio ; Cursor / Copilot use the same SKILL.md layout.
```

Then just ask: *"turn this paper into a perceptive-gap WeChat draft."* The agent reads
`skills/dsh-ip-studio/SKILL.md`, drafts from `references/methodology.md`, and calls
`node scripts/ip-studio.mjs outline|review|format` for the deterministic steps. Requires only Node.

## Use

Tell the model: *"use `ip-studio` to turn this paper into a perceptive-gap WeChat draft."* It produces the
draft, runs `ip_studio_review` for the final check, then `ip_studio_format` for layout. It stops at the
draft by default; publishing only starts when you explicitly ask to create/publish a draft.

## Security

- No postinstall / install scripts, no external binary downloads, no network calls from the plugin.
- Ships no secrets; credentials live only in an external file on the user's machine.
- Publishing is always a manual-confirm step (an unverified personal account cannot publish via API).

## Publish your own

This package is set up for `github.com/CarryChang/dsh-ip-studio`. If you fork it, update `repository` /
`homepage` / `bugs` and the docs to your owner, pass `pnpm run check`, then `npm publish` (`prepack`
rebuilds `lib`). To get listed on the DSH hub see [`docs/hub-registration.md`](./docs/hub-registration.md)
and tag the repo with the `dsh-plugin` topic.

## License

MIT — see [LICENSE](LICENSE). Changes are recorded in [CHANGELOG.md](CHANGELOG.md).
