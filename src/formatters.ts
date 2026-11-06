/**
 * Deterministic Markdown to per-channel formatting. No network, no image upload, no model:
 * it rewrites structure and encodes the channel-specific tags that make a draft render, and
 * returns notes about the steps that stay with the external publish adapter.
 * @module dsh-ip-studio/formatters
 */

import type { Platform } from './review.ts'

/** Result of formatting one draft for one channel. */
export interface FormattedOutput {
  platform: Platform
  /** The formatted body: HTML for web channels, text/markdown otherwise. */
  content: string
  /** Follow-up steps the adapter or author must still do; empty when the output is final. */
  notes: string[]
}

/** Brand accent shared with config/publish.example.json. */
const ACCENT = '#4F46E5'
const ACCENT_SOFT = '#EEF2FF'
const TEXT = '#1F2329'
const MUTED = '#8A8F99'

/** Escape HTML control characters in text runs. */
function esc(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * WeChat body image tag. The `class="rich_pages wxw-img"` plus data-* attributes are what make the
 * editor mount the image; a bare `<img src>` gets normalized to a hidden `data-src` and shows as
 * zero images. Real ratio/width/type are filled by the adapter after upload; here they stay neutral.
 */
function imgTag(src: string): string {
  const type = (src.match(/\.(png|jpe?g|gif|webp)$/i)?.[1] ?? 'png').replace('jpg', 'jpeg')
  return `<img class="rich_pages wxw-img" data-ratio="0" data-w="0" data-type="${type}" data-src="${esc(src)}"`
    + ` style="width:100%;height:auto;display:block;margin:1em 0">`
}

/** Inline transforms: bold, italic, links. Images are handled at block level. */
function inline(text: string, wechat: boolean): string {
  let out = esc(text)
  out = out.replace(/!\[([^\]]*)\]\(([^)]+?)\)/g, (_m, alt: string, target: string) => {
    const src = target.replace(/\s+["'].*["']\s*$/, '').trim()
    return wechat ? imgTag(src) : `<img src="${esc(src)}" alt="${alt}" style="max-width:100%">`
  })
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  out = out.replace(/`([^`]+)`/g, `<code style="background:${ACCENT_SOFT};color:${TEXT};padding:1px 6px;border-radius:4px;font-size:90%">$1</code>`)
  out = out.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
  return out
}

/** A caption is a lone italic line: `*…*` or `_…_`. It pairs with the figure above it. */
function isCaption(text: string): boolean {
  return /^\*[^*\n]+\*$/.test(text) || /^_[^_\n]+_$/.test(text)
}

/** Strip the italic wrapper from a caption line. */
function captionText(text: string): string {
  return text.trim().replace(/^[*_]/, '').replace(/[*_]$/, '').trim()
}

/** A lone image line `![alt](src)` eligible to be grouped with a following caption. */
function standaloneImage(rows: string[]): string | null {
  if (rows.length !== 1) return null
  const m = (rows[0] ?? '').match(/^!\[[^\]]*\]\(([^)]+?)\)\s*$/)
  if (!m) return null
  return (m[1] ?? '').replace(/\s+["'].*["']\s*$/, '').trim()
}

/** Render GitHub markdown tables to HTML tables; WeChat needs them as images instead. */
function renderTable(block: string[]): { html: string; isTable: boolean } {
  const cells = (row: string): string[] => row.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim())
  const head = cells(block[0] ?? '')
  const body = block.slice(2).map(cells)
  const th = head.map(h => `<th style="border:1px solid #ddd;padding:6px 10px;background:${ACCENT_SOFT}">${esc(h)}</th>`).join('')
  const trs = body.map(r => `<tr>${r.map(c => `<td style="border:1px solid #ddd;padding:6px 10px">${esc(c)}</td>`).join('')}</tr>`).join('')
  return { html: `<table style="border-collapse:collapse;width:100%;margin:1em 0"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`, isTable: true }
}

/** Convert markdown to inline-styled WeChat HTML, grouping figures with their captions. */
function toWechatHtml(md: string): string {
  const blocks = md.replace(/\r\n/g, '\n').split(/\n{2,}/)
  const out: string[] = []
  for (let i = 0; i < blocks.length; i++) {
    const rows = (blocks[i] ?? '').split('\n')
    const first = rows[0] ?? ''
    const second = rows[1] ?? ''

    // Figure: a lone image line, optionally followed by a lone italic caption block.
    const img = standaloneImage(rows)
    if (img !== null) {
      const next = (blocks[i + 1] ?? '').trim()
      if (next && !next.includes('\n') && isCaption(next)) {
        out.push(`<figure style="margin:1.2em 0;text-align:center">${imgTag(img)}`
          + `<figcaption style="font-style:italic;color:${MUTED};font-size:14px;line-height:1.6;margin:6px 0 0">${esc(captionText(next))}</figcaption></figure>`)
        i++
        continue
      }
      out.push(imgTag(img))
      continue
    }

    if (rows.length >= 2 && /^\s*\|/.test(first) && /^\s*\|[\s:|-]+\|/.test(second)) {
      out.push(renderTable(rows).html)
      continue
    }
    if (rows.length === 1 && /^\s*([-*_])\s*(\1\s*){2,}$/.test(first)) {
      out.push(`<hr style="border:none;border-top:1px solid #e6e8eb;margin:1.6em 0">`)
      continue
    }
    const heading = first.match(/^(#{1,4})\s+(.*)$/)
    if (heading && rows.length === 1) {
      const level = (heading[1] ?? '').length
      const text = inline(heading[2] ?? '', true)
      const base = `margin:1.4em 0 0.6em;font-weight:700;color:${TEXT}`
      if (level === 1) out.push(`<h1 style="${base};font-size:22px">${text}</h1>`)
      else if (level === 2) out.push(`<h2 style="${base};font-size:19px;border-left:4px solid ${ACCENT};padding-left:10px">${text}</h2>`)
      else out.push(`<h3 style="${base};font-size:17px">${text}</h3>`)
      continue
    }
    if (rows.every(r => r.startsWith('>'))) {
      const inner = rows.map(r => inline(r.replace(/^>\s?/, ''), true)).join('<br>')
      out.push(`<blockquote style="border-left:3px solid ${ACCENT};background:${ACCENT_SOFT};color:#4a4f57;margin:1em 0;padding:8px 14px;border-radius:4px">${inner}</blockquote>`)
      continue
    }
    if (rows.every(r => /^[-*]\s+/.test(r))) {
      const items = rows.map(r => `<li style="margin:4px 0">${inline(r.replace(/^[-*]\s+/, ''), true)}</li>`).join('')
      out.push(`<ul style="padding-left:1.4em;color:${TEXT};line-height:1.75">${items}</ul>`)
      continue
    }
    if (rows.every(r => /^\d+[.)]\s+/.test(r))) {
      const items = rows.map(r => `<li style="margin:4px 0">${inline(r.replace(/^\d+[.)]\s+/, ''), true)}</li>`).join('')
      out.push(`<ol style="padding-left:1.5em;color:${TEXT};line-height:1.75">${items}</ol>`)
      continue
    }
    const joined = inline(rows.join('<br>'), true)
    out.push(`<p style="margin:0.9em 0;line-height:1.8;color:${TEXT};font-size:16px">${joined}</p>`)
  }
  return out.join('\n')
}

/** Split text into X posts of at most 280 characters at paragraph/sentence boundaries. */
function toXThread(md: string): string[] {
  const paras = md.split(/\n{2,}/).map(p => p.replace(/^#{1,4}\s+/, '').replace(/[*_`>#]/g, '').trim()).filter(Boolean)
  const posts: string[] = []
  for (const para of paras) {
    let rest = para
    while (rest.length > 280) {
      let cut = rest.lastIndexOf(' ', 280)
      if (cut < 100) {
        const stop = rest.search(/[。！？.!?]\s*/)
        cut = stop < 0 ? 280 : stop + 1
      }
      posts.push(rest.slice(0, cut).trim())
      rest = rest.slice(cut).trim()
    }
    if (rest) posts.push(rest)
  }
  return posts.map((p, i) => `${i + 1}/${posts.length} ${p}`)
}

/** Condense markdown into a Xiaohongshu-style short note with emoji bullets. */
function toXiaohongshu(md: string): string {
  const title = md.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? ''
  const points = [...md.matchAll(/^[-*]\s+(.+)$|^\d+\.\s+(.+)$/gm)].map(m => (m[1] ?? m[2] ?? '').trim())
  const body = points.slice(0, 6).map(p => `🔸 ${p}`).join('\n')
  return `${title}\n\n${body || md.replace(/[#*>`]/g, '').trim().slice(0, 800)}`
}

/** Wrap markdown with blog front-matter, keeping the source as the body. */
function toBlog(md: string): string {
  const title = md.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? 'Untitled'
  return `---\ntitle: ${title}\ndraft: true\n---\n\n${md}`
}

/**
 * Format one markdown draft for a channel.
 * @param md - raw markdown draft.
 * @param platform - target channel.
 * @returns the {@link FormattedOutput} body plus adapter follow-up notes.
 */
export function format(md: string, platform: Platform): FormattedOutput {
  switch (platform) {
    case 'wechat': {
      const content = toWechatHtml(md)
      const notes: string[] = []
      if (content.includes('<table')) {
        notes.push('正文含表格：微信草稿不渲染 <table>，发布前用 render 工具把每张表转成 PNG 再替换。')
      }
      if (/<img class="rich_pages/.test(content)) {
        notes.push('正文图片用了微信规范标签但 data-ratio/data-w 仍为 0：adapter 上传取真实宽高后回填，否则编辑器可能不显示。')
      }
      return { platform, content, notes }
    }
    case 'zhihu':
      return { platform, content: md, notes: ['知乎支持 Markdown 表格与图片链接，成稿可直接粘贴；图片建议先转 https 图床。'] }
    case 'x':
      return { platform, content: toXThread(md).join('\n\n---\n\n'), notes: ['已按 ≤280 字切分为 thread，逐条发布。'] }
    case 'xiaohongshu':
      return { platform, content: toXiaohongshu(md), notes: ['已压缩为小红书短笔记；封面与话题标签在发布端补充。'] }
    case 'blog':
      return { platform, content: toBlog(md), notes: ['已加 front-matter，draft: true，发布前改为 false。'] }
  }
}
