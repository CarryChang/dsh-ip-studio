/**
 * dsh-ip-studio Cordis plugin entry. Contributes the perceptive-gap writing methodology as an
 * embedded skill and registers two deterministic, offline tools: draft review and multi-platform
 * formatting. It opens no network, subprocess or credential surface; publishing stays behind the
 * user's external adapter.
 * @module dsh-ip-studio
 */

import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { defineTool } from '@deepseek-ai/dsh-tools'
// Type-only: pulls the `ctx.skills` service declaration into the Context graph.
import type {} from '@deepseek-ai/dsh-skill'
import { SKILL_NAME, SKILL_DESCRIPTION, SKILL_WHEN_TO_USE, SKILL_BODY } from './methodology.ts'
import { reviewDraft, asPlatform, PLATFORMS, type Platform } from './review.ts'
import { format, type Brand } from './formatters.ts'

export const name = 'ip-studio'
export const inject = ['skills', 'tools']

/** Deployment configuration for the plugin. */
export interface Config {
  /** Channel assumed when a call omits `platform`. */
  defaultPlatform: Platform
}

export const Config: z<Config> = z.object({
  defaultPlatform: z.union([
    z.const('wechat'), z.const('zhihu'), z.const('xiaohongshu'), z.const('x'), z.const('blog'),
  ]).default('wechat'),
})

const PLATFORM_SET = [...PLATFORMS] as [string, ...string[]]

/**
 * Register the methodology skill and the review/format tools.
 * @param ctx - registrant context carrying the skill and tool registries.
 * @param config - deployment's default channel choice.
 * @returns when the plugin is ready.
 */
export async function apply(ctx: Context, config: Config): Promise<void> {
  const defaultPlatform = config.defaultPlatform

  ctx.effect(() => ctx.skills.register({
    name: SKILL_NAME,
    description: SKILL_DESCRIPTION,
    whenToUse: SKILL_WHEN_TO_USE,
    content: SKILL_BODY,
    source: 'bundled',
    invocation: { modelInvocable: true, userInvocable: true },
  }))

  ctx.effect(() => ctx.tools.register(defineTool({
    name: 'ip_studio_review',
    description:
      'Check an IP/公众号 draft against the perceptive-gap methodology: wording red lines '
      + '(偏见 / 我的观点 / 对抗式收尾 / 评论者 / 旧称), Markdown tables that WeChat will not render, '
      + 'non-ASCII image names, image count, title length and Chinese length budget. '
      + 'Returns structured blockers and warnings before formatting or publishing.',
    parameters: {
      markdown: { type: 'string', required: true, description: 'The raw markdown draft to review.' },
      platform: {
        type: 'string',
        enum: PLATFORM_SET,
        description: `Target channel; defaults to "${defaultPlatform}".`,
      },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(JSON.parse(value), null, 2) }],
    },
    execute(args) {
      const platform = args.platform ? asPlatform(args.platform) : defaultPlatform
      return Promise.resolve(JSON.stringify(reviewDraft(args.markdown, platform)))
    },
    presentCall: args => ({
      card: 'generic',
      title: `Review draft (${args.platform ?? defaultPlatform})`,
      kind: 'other',
      rawInput: { platform: args.platform ?? defaultPlatform, chars: args.markdown.length },
    }),
  })))

  ctx.effect(() => ctx.tools.register(defineTool({
    name: 'ip_studio_format',
    description:
      'Format a markdown draft for one publishing channel, offline: WeChat inline-style HTML '
      + '(with the rich_pages wxw-img image-tag convention), Zhihu markdown, Xiaohongshu short note, '
      + 'X thread split at 280 chars, or blog front-matter. Auto-injects placeholder captions and '
      + 'rename hints for figures missing captions or with non-ASCII names. Returns the formatted body, '
      + 'the ordered local image list, and adapter follow-up notes. It never uploads images or calls a '
      + 'platform API.',
    parameters: {
      markdown: { type: 'string', required: true, description: 'The raw markdown draft to format.' },
      platform: {
        type: 'string',
        enum: PLATFORM_SET,
        description: `Target channel; defaults to "${defaultPlatform}".`,
      },
      brand: {
        type: 'object',
        additionalProperties: false,
        description: 'Optional theme palette (mirrors config/publish.example.json brand); merges over the 实用AI default.',
        properties: {
          name: { type: 'string' },
          accent: { type: 'string' },
          accentSoft: { type: 'string' },
          text: { type: 'string' },
          muted: { type: 'string' },
        },
      },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(JSON.parse(value), null, 2) }],
    },
    execute(args) {
      const platform = args.platform ? asPlatform(args.platform) : defaultPlatform
      const brand = args.brand as Partial<Brand> | undefined
      return Promise.resolve(JSON.stringify(format(args.markdown, platform, brand)))
    },
    presentCall: args => ({
      card: 'generic',
      title: `Format for ${args.platform ?? defaultPlatform}`,
      kind: 'other',
      rawInput: { platform: args.platform ?? defaultPlatform, themed: args.brand !== undefined },
    }),
  })))
}
