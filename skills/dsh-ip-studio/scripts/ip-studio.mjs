#!/usr/bin/env node
/**
 * Standalone CLI for the dsh-ip-studio Agent Skill. Runs the same deterministic logic as the DeepSeek
 * Harness tools (`ip_studio_outline` / `ip_studio_review` / `ip_studio_format`) with plain Node and no
 * harness, so Claude Code / Cursor / Copilot can call it through their shell tool. Offline: no network,
 * no credentials, no image upload — publishing stays the user's external adapter.
 *
 * Usage:
 *   node ip-studio.mjs outline  [--title-hint "<subject>"]              [input]
 *   node ip-studio.mjs review   [--platform <p>]                        [input]
 *   node ip-studio.mjs format   [--platform <p>] [--brand "<json>"]     [input]
 *
 * [input] is `--input <file>` or a positional file path; omit either to pipe markdown on stdin.
 * Platforms: wechat | zhihu | xiaohongshu | x | blog (default wechat).
 * Prints a JSON result to stdout.
 */
import { readFileSync } from 'node:fs'
import { reviewDraft, asPlatform } from './lib/review.js'
import { format } from './lib/formatters.js'
import { buildOutline } from './lib/outline.js'

/** Parse `--flag value` / `--input <file>` / a trailing positional file from argv into a map. */
function parseArgs(argv) {
  const flags = {}
  const positional = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      const key = a.slice(2)
      const next = argv[i + 1]
      if (next !== undefined && !next.startsWith('--')) {
        flags[key] = next
        i++
      } else {
        flags[key] = true
      }
    } else {
      positional.push(a)
    }
  }
  return { flags, positional }
}

/** Read markdown from an explicit file, a positional path, or stdin. */
async function readInput(flags, positional) {
  const file = flags.input ?? (positional.length ? positional[0] : undefined)
  if (file) return readFileSync(file, 'utf8')
  if (process.stdin.isTTY) {
    throw new Error('no input: pass --input <file>, a file path, or pipe markdown on stdin')
  }
  const chunks = []
  for await (const chunk of process.stdin) chunks.push(chunk)
  return Buffer.concat(chunks).toString('utf8')
}

/** Parse a `--brand` value as inline JSON, or as a path to a JSON file when it names one. */
function parseBrand(brand) {
  if (brand === undefined || brand === true) return undefined
  const raw = String(brand).trim()
  if (raw.startsWith('{')) return JSON.parse(raw)
  return JSON.parse(readFileSync(raw, 'utf8'))
}

const [, , command, ...rest] = process.argv
const { flags, positional } = parseArgs(rest)
const platform = typeof flags.platform === 'string' ? asPlatform(flags.platform) : 'wechat'
const input = await readInput(flags, positional)

switch (command) {
  case 'outline':
    console.log(JSON.stringify(buildOutline(input, { titleHint: flags['title-hint'] }), null, 2))
    break
  case 'review':
    console.log(JSON.stringify(reviewDraft(input, platform), null, 2))
    break
  case 'format':
    console.log(JSON.stringify(format(input, platform, parseBrand(flags.brand)), null, 2))
    break
  default:
    console.error('usage: node ip-studio.mjs <outline|review|format> [options] [input]')
    process.exit(2)
}
