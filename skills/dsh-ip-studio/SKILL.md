---
name: dsh-ip-studio
description: Turn papers, notes and news into publish-ready personal-IP drafts using perceptive-gap (认知差) writing — a distinctive viewpoint, not earlier access to information. Use when the user asks to rewrite or interpret material into an article, build a WeChat / Zhihu / Xiaohongshu / X / blog draft, seed a draft skeleton, red-line or layout-check a draft, or format a draft for publishing. Bundles a deterministic offline CLI (outline / review / format) so it works in Claude Code, Cursor, Copilot and other Agent-Skills agents with no DeepSeek Harness.
license: MIT
metadata:
  version: 0.8.0
  author: 实用AI
  homepage: https://github.com/CarryChang/dsh-ip-studio
  keywords: content-writing, personal-ip, perceptive-gap, wechat, agent-skill
---

# dsh-ip-studio — Perceptive-gap content studio

Turn a paper, note dump or news item into a **publish-ready draft that builds a personal IP**. The
core is a platform-agnostic 认知差 (perceptive-gap) writing method; three deterministic offline
commands do the scaffolding, the final check and the multi-platform layout. The skill ships **no
network calls, no credentials and no install step** — publishing to a platform stays a separate,
user-owned adapter (see [references/platform-adapters.md](references/platform-adapters.md)).

## When to reach for this

- The user hands over a PDF / txt / web dump / screenshot and says "整理成稿 / 解读这篇 / 写成公众号 / 按 IP 改写".
- The user wants a draft checked before publishing, or a draft reformatted for another channel.
- The user wants to capture "这套流程" as a reusable method.

## The perceptive-gap core (non-negotiable)

Personal IP = a unique reading of the world, not earlier access to news.

- Information gap ("I saw a headline you did not") — AI already flattened it; not worth writing.
- Perceptive gap ("we both know this event, but I see the underlying logic and reach a different
  conclusion") — this is the article's value.

Before drafting, ask three questions of the material: ① what is the mainstream narrative; ② what does
it miss / what does the other side say; ③ can you name a framework the reader can take away. **The
quietly-overturned assumption is the seed of the perceptive gap.** Full rules — voice, article
skeleton, wording red lines, figure/knowledge-visualisation requirements — are in
[references/methodology.md](references/methodology.md). Read it before drafting a serious piece.

## Workflow (stop at the draft; enter the last stage only when asked to publish)

0. Ingest the material and agree the deliverable tier with the user.
1. Read figures with vision (coordinate axes / curves / architecture diagrams), extract facts and
   find the overturned assumption. Get the user's sign-off on the main line before writing.
2. Seed a skeleton with the outline command, then draft `xxx_ip.md` following the methodology.
3. Plan 3–8 figures (extracted originals, tables→PNG, one self-drawn framework diagram) with captions.
4. Format for the target channel with the format command.
5. Publish only on explicit request, via the user's external adapter, with a manual confirm step.

## Commands (offline, deterministic)

Run from this skill directory with plain Node (no dependencies). Pipe markdown on stdin, or pass a
file with `--input`.

```sh
# 1) Seed a seven-part perceptive-gap skeleton from extracted material text:
node scripts/ip-studio.mjs outline --title-hint "<subject>" --input material.txt

# 2) Red-line + layout check a draft; returns { findings, publishable }. Run before publishing.
node scripts/ip-studio.mjs review --platform wechat --input draft.md

# 3) Format for one channel; returns { content, images, notes }.
#    platforms: wechat | zhihu | xiaohongshu | x | blog (default wechat)
node scripts/ip-studio.mjs format --platform wechat --input draft.md
node scripts/ip-studio.mjs format --platform xiaohongshu --input draft.md --brand '{"name":"我的品牌","accent":"#4F46E5"}'
```

- A text-only long-form draft is rejected for WeChat (`no-figures` blocker): interleave figures.
- `images` lists local figure files for the adapter to upload; `notes` carry caption/rename fixes.
- `--brand` accepts inline JSON or a path to a JSON palette file (see `references/platform-adapters.md`).

## Security boundary

No postinstall, no external binaries, no network, no secrets in the package. Credentials for
publishing live only in an external file on the user's machine; the final publish is always a manual
confirm step (an unverified personal WeChat account cannot publish via API).
