/**
 * Deterministic Markdown to per-channel formatting. No network, no image upload, no model:
 * it rewrites structure, encodes the channel-specific tags that make a draft render, themes the
 * output from a brand palette, auto-fills placeholder captions and rename hints for figures, and
 * returns notes about the steps that stay with the external publish adapter.
 * @module dsh-ip-studio/formatters
 */

import type { Platform } from './review.ts'

/** Brand palette for themed output; mirrors config/publish.example.json's `brand`. */
export interface Brand {
  name: string
  accent: string
  accentSoft: string
  text: string
  muted: string
}

/** Default 实用AI palette; callers override per deployment via the `brand` argument. */
export const DEFAULT_BRAND: Brand = {
  name: '实用AI', accent: '#4F46E5', accentSoft: '#EEF2FF', text: '#1F2329', muted: '#8A8F99',
}

/** Result of formatting one draft for one channel. */
export interface FormattedOutput {
  platform: Platform
  /** The formatted body: HTML for web channels, text/markdown otherwise. */
  content: string
  /** Ordered ASCII local image files referenced, for the adapter to upload on every channel. */
  images: string[]
  /** Follow-up steps the adapter or author must still do (rename/caption fixes); empty when final. */
  notes: string[]
}

/** Escape HTML control characters in text runs. */
function esc(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * WeChat body image tag. The path is written to `src` (not the editor-only `data-src`) so the
 * generated HTML renders in a local browser preview; `class="rich_pages wxw-img"` stays for the
 * editor. Real ratio/width/type and the CDN URL are filled by the adapter after upload; here they
 * stay neutral.
 */
function imgTag(src: string): string {
  const type = (src.match(/\.(png|jpe?g|gif|webp)$/i)?.[1] ?? 'png').replace('jpg', 'jpeg')
  return `<img class="rich_pages wxw-img" data-ratio="0" data-w="0" data-type="${type}" src="${esc(src)}"`
    + ` style="width:100%;height:auto;display:block;margin:1em 0">`
}

/** Inline transforms: bold, italic, links, inline code. Images are handled at block level. */
function inline(text: string, wechat: boolean, b: Brand): string {
  let out = esc(text)
  out = out.replace(/!\[([^\]]*)\]\(([^)]+?)\)/g, (_m, alt: string, target: string) => {
    const src = target.replace(/\s+["'].*["']\s*$/, '').trim()
    return wechat ? imgTag(src) : `<img src="${esc(src)}" alt="${alt}" style="max-width:100%">`
  })
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  if (wechat) out = out.replace(/`([^`]+)`/g, `<code style="background:${b.accentSoft};color:${b.text};padding:1px 6px;border-radius:4px;font-size:90%">$1</code>`)
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

/** Ordered figures: each lone image line with an optional following italic caption line. */
function collectImages(md: string): { src: string; caption?: string }[] {
  const rows = md.replace(/\r\n/g, '\n').split('\n')
  const out: { src: string; caption?: string }[] = []
  for (let i = 0; i < rows.length; i++) {
    const m = (rows[i] ?? '').match(/^!\[[^\]]*\]\(([^)]+?)\)\s*$/)
    if (!m) continue
    const src = (m[1] ?? '').replace(/\s+["'].*["']\s*$/, '').trim()
    let j = i + 1
    while (j < rows.length && (rows[j] ?? '').trim() === '') j++
    const next = (rows[j] ?? '').trim()
    const caption = isCaption(next) ? captionText(next) : undefined
    out.push(caption ? { src, caption } : { src })
  }
  return out
}

/** True when a local (non-http) image path has whitespace, percent-encoding, or non-ASCII in the name. */
function isBadImageName(src: string): boolean {
  if (/^https?:/i.test(src)) return false
  const base = src.split('/').pop() ?? src
  return /[\s%\u3400-\u9fff]/.test(base)
}

/** Deterministic ASCII replacement for a non-conforming image name, preserving the extension. */
function suggestImageName(src: string, index: number): string {
  const ext = src.match(/\.(png|jpe?g|gif|webp)$/i)?.[1]?.toLowerCase() ?? 'png'
  return `fig${index}.${ext}`
}

/** Render GitHub markdown tables to HTML tables; WeChat needs them as images instead. */
function renderTable(block: string[], b: Brand): string {
  const cells = (row: string): string[] => row.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim())
  const head = cells(block[0] ?? '')
  const body = block.slice(2).map(cells)
  const th = head.map(h => `<th style="border:1px solid #ddd;padding:6px 10px;background:${b.accentSoft}">${esc(h)}</th>`).join('')
  const trs = body.map(r => `<tr>${r.map(c => `<td style="border:1px solid #ddd;padding:6px 10px">${esc(c)}</td>`).join('')}</tr>`).join('')
  return `<table style="border-collapse:collapse;width:100%;margin:1em 0"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`
}

/** Convert markdown to inline-styled WeChat HTML, grouping figures and injecting placeholder captions. */
function toWechatHtml(md: string, b: Brand): string {
  const blocks = md.replace(/\r\n/g, '\n').split(/\n{2,}/)
  const out: string[] = []
  let fig = 0
  for (let i = 0; i < blocks.length; i++) {
    const rows = (blocks[i] ?? '').split('\n')
    const first = rows[0] ?? ''
    const second = rows[1] ?? ''

    const img = standaloneImage(rows)
    if (img !== null) {
      fig++
      const next = (blocks[i + 1] ?? '').trim()
      let caption: string
      if (next && !next.includes('\n') && isCaption(next)) {
        caption = esc(captionText(next))
        i++
      } else {
        caption = `图 ${fig}（图注待补：一句话说明该看什么）`
      }
      out.push(`<figure style="margin:1.2em 0;text-align:center">${imgTag(img)}`
        + `<figcaption style="font-style:italic;color:${b.muted};font-size:14px;line-height:1.6;margin:6px 0 0">${caption}</figcaption></figure>`)
      continue
    }

    if (rows.length >= 2 && /^\s*\|/.test(first) && /^\s*\|[\s:|-]+\|/.test(second)) {
      out.push(renderTable(rows, b))
      continue
    }
    if (rows.length === 1 && /^\s*([-*_])\s*(\1\s*){2,}$/.test(first)) {
      out.push('<hr style="border:none;border-top:1px solid #e6e8eb;margin:1.6em 0">')
      continue
    }
    const heading = first.match(/^(#{1,4})\s+(.*)$/)
    if (heading && rows.length === 1) {
      const level = (heading[1] ?? '').length
      const text = inline(heading[2] ?? '', true, b)
      const base = `margin:1.4em 0 0.6em;font-weight:700;color:${b.text}`
      if (level === 1) out.push(`<h1 style="${base};font-size:22px">${text}</h1>`)
      else if (level === 2) out.push(`<h2 style="${base};font-size:19px;border-left:4px solid ${b.accent};padding-left:10px">${text}</h2>`)
      else out.push(`<h3 style="${base};font-size:17px">${text}</h3>`)
      continue
    }
    if (rows.every(r => r.startsWith('>'))) {
      const inner = rows.map(r => inline(r.replace(/^>\s?/, ''), true, b)).join('<br>')
      out.push(`<blockquote style="border-left:3px solid ${b.accent};background:${b.accentSoft};color:#4a4f57;margin:1em 0;padding:8px 14px;border-radius:4px">${inner}</blockquote>`)
      continue
    }
    if (rows.every(r => /^[-*]\s+/.test(r))) {
      const items = rows.map(r => `<li style="margin:4px 0">${inline(r.replace(/^[-*]\s+/, ''), true, b)}</li>`).join('')
      out.push(`<ul style="padding-left:1.4em;color:${b.text};line-height:1.75">${items}</ul>`)
      continue
    }
    if (rows.every(r => /^\d+[.)]\s+/.test(r))) {
      const items = rows.map(r => `<li style="margin:4px 0">${inline(r.replace(/^\d+[.)]\s+/, ''), true, b)}</li>`).join('')
      out.push(`<ol style="padding-left:1.5em;color:${b.text};line-height:1.75">${items}</ol>`)
      continue
    }
    const joined = inline(rows.join('<br>'), true, b)
    out.push(`<p style="margin:0.9em 0;line-height:1.8;color:${b.text};font-size:16px">${joined}</p>`)
  }
  return out.join('\n')
}

/** Split markdown into X posts, keeping each figure as a media post with its caption. */
function toXThread(md: string): string[] {
  const capOf = new Map(collectImages(md).filter(im => im.caption).map(im => [im.src, im.caption as string]))
  const blocks = md.replace(/\r\n/g, '\n').split(/\n{2,}/)
  const posts: string[] = []
  for (const block of blocks) {
    const rows = block.split('\n')
    const img = standaloneImage(rows)
    if (img !== null) {
      const cap = capOf.get(img)
      posts.push(`📎 配图 ${img}${cap ? `：${cap}` : ''}`)
      continue
    }
    const text = rows.join(' ')
      .replace(/^#{1,4}\s+/, '')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/[*_`>]/g, '')
      .trim()
    if (!text) continue
    let rest = text
    while (rest.length > 270) {
      let cut = rest.lastIndexOf(' ', 270)
      if (cut < 100) {
        const stop = rest.search(/[。！？.!?]\s*/)
        cut = stop < 0 ? 270 : stop + 1
      }
      posts.push(rest.slice(0, cut).trim())
      rest = rest.slice(cut).trim()
    }
    if (rest) posts.push(rest)
  }
  return posts.map((p, i) => `${i + 1}/${posts.length} ${p}`)
}

/** 小红书：标题 + 正文要点 + 按序配图清单（图文混排，缺图注处补占位），末尾署品牌名。 */
function toXiaohongshu(md: string, b: Brand): string {
  const title = md.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? ''
  const points = [...md.matchAll(/^[-*]\s+(.+)$|^\d+[.)]\s+(.+)$/gm)].map(m => (m[1] ?? m[2] ?? '').trim()).filter(Boolean)
  const imgs = collectImages(md)
  const body = points.length
    ? points.slice(0, 8).map(p => `🔸 ${p}`).join('\n')
    : md.replace(/[#*>`]/g, '').replace(/!\[[^\]]*\]\([^)]*\)/g, '').trim().slice(0, 800)
  const figBlock = imgs.length
    ? `\n\n【配图 ${imgs.length} 张·按序上传】\n` + imgs.map((im, idx) => `${idx + 1}. ${im.src}｜${im.caption ?? '（图注待补）'}`).join('\n')
    : ''
  return `${title}\n\n${body}${figBlock}\n\n—— ${b.name}`
}

/** Wrap markdown with blog front-matter (author from brand), keeping the source as the body. */
function toBlog(md: string, b: Brand): string {
  const title = md.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? 'Untitled'
  return `---\ntitle: ${title}\nauthor: ${b.name}\ndraft: true\n---\n\n${md}`
}

/** Figure-level repair hints shared by every channel: bad names and missing captions. */
function figureFixes(imgs: { src: string; caption?: string }[]): string[] {
  const fixes: string[] = []
  imgs.forEach((im, idx) => {
    if (isBadImageName(im.src)) fixes.push(`配图 ${idx + 1}「${im.src}」文件名不合规范：发布前重命名为 ${suggestImageName(im.src, idx + 1)} 并在正文改用该名。`)
    if (!im.caption) fixes.push(`配图 ${idx + 1}（${im.src}）缺图注：补一句中文说明「该看什么」（排版已注入占位图注）。`)
  })
  return fixes
}

/**
 * Format one markdown draft for a channel.
 * @param md - raw markdown draft.
 * @param platform - target channel.
 * @param brand - optional theme palette override; merged over {@link DEFAULT_BRAND}.
 * @returns the {@link FormattedOutput} body, ordered image list, and adapter follow-up notes.
 */
export function format(md: string, platform: Platform, brand?: Partial<Brand>): FormattedOutput {
  const b: Brand = { ...DEFAULT_BRAND, ...brand }
  const imgs = collectImages(md)
  const images = imgs.map(im => im.src)
  const fixes = figureFixes(imgs)
  switch (platform) {
    case 'wechat': {
      const inner = toWechatHtml(md, b)
      const content = `<section style="font-family:-apple-system,'PingFang SC','Microsoft YaHei',sans-serif;line-height:1.8;color:${b.text};word-break:break-word">${inner}</section>`
      const notes: string[] = []
      if (inner.includes('<table')) notes.push('正文含表格：微信草稿不渲染 <table>，发布前用 render 工具把每张表转成 PNG 再替换。')
      if (/<img class="rich_pages/.test(inner)) notes.push('正文图片用了微信规范标签但 data-ratio/data-w 仍为 0：adapter 上传取真实宽高后回填，否则编辑器可能不显示。')
      return { platform, content, images, notes: [...notes, ...fixes] }
    }
    case 'zhihu':
      return { platform, content: md, images, notes: ['知乎支持 Markdown 表格与图片链接，成稿可直接粘贴；本地图片（见 images）建议先转 https 图床。', ...fixes] }
    case 'x':
      return { platform, content: toXThread(md).join('\n\n---\n\n'), images, notes: [`已按 ≤280 字切分为 thread，逐条发布。${images.length ? `其中 ${images.length} 条为配图推文，按 images 顺序附对应文件。` : ''}`, ...fixes] }
    case 'xiaohongshu':
      return { platform, content: toXiaohongshu(md, b), images, notes: [images.length ? `已按图文混排整理：正文要点 + ${images.length} 张配图按序列出（见 images）；封面从配图另选或补白。` : '已压缩为小红书短笔记；建议补 1–3 张配图。', ...fixes] }
    case 'blog':
      return { platform, content: toBlog(md, b), images, notes: ['已加 front-matter，draft: true，发布前改为 false。', ...fixes] }
  }
}
