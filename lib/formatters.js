/**
 * Deterministic Markdown to per-channel formatting. No network, no image upload, no model:
 * it rewrites structure and encodes the channel-specific tags that make a draft render, and
 * returns notes about the steps that stay with the external publish adapter.
 * @module dsh-ip-studio/formatters
 */
/** Brand accent shared with config/publish.example.json. */
const ACCENT = '#4F46E5';
const ACCENT_SOFT = '#EEF2FF';
const TEXT = '#1F2329';
const MUTED = '#8A8F99';
/** Escape HTML control characters in text runs. */
function esc(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
/**
 * WeChat body image tag. The `class="rich_pages wxw-img"` plus data-* attributes are what make the
 * editor mount the image; a bare `<img src>` gets normalized to a hidden `data-src` and shows as
 * zero images. Real ratio/width/type are filled by the adapter after upload; here they stay neutral.
 */
function imgTag(src) {
    const type = (src.match(/\.(png|jpe?g|gif|webp)$/i)?.[1] ?? 'png').replace('jpg', 'jpeg');
    return `<img class="rich_pages wxw-img" data-ratio="0" data-w="0" data-type="${type}" data-src="${esc(src)}"`
        + ` style="width:100%;height:auto;display:block;margin:1em 0">`;
}
/** Inline transforms: bold, italic, links. Images are handled at block level. */
function inline(text, wechat) {
    let out = esc(text);
    out = out.replace(/!\[([^\]]*)\]\(([^)]+?)\)/g, (_m, alt, target) => {
        const src = target.replace(/\s+["'].*["']\s*$/, '').trim();
        return wechat ? imgTag(src) : `<img src="${esc(src)}" alt="${alt}" style="max-width:100%">`;
    });
    out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/`([^`]+)`/g, `<code style="background:${ACCENT_SOFT};color:${TEXT};padding:1px 6px;border-radius:4px;font-size:90%">$1</code>`);
    out = out.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
    return out;
}
/** A caption is a lone italic line: `*…*` or `_…_`. It pairs with the figure above it. */
function isCaption(text) {
    return /^\*[^*\n]+\*$/.test(text) || /^_[^_\n]+_$/.test(text);
}
/** Strip the italic wrapper from a caption line. */
function captionText(text) {
    return text.trim().replace(/^[*_]/, '').replace(/[*_]$/, '').trim();
}
/** A lone image line `![alt](src)` eligible to be grouped with a following caption. */
function standaloneImage(rows) {
    if (rows.length !== 1)
        return null;
    const m = (rows[0] ?? '').match(/^!\[[^\]]*\]\(([^)]+?)\)\s*$/);
    if (!m)
        return null;
    return (m[1] ?? '').replace(/\s+["'].*["']\s*$/, '').trim();
}
/** Ordered figures: each lone image line with an optional following italic caption line. */
function collectImages(md) {
    const rows = md.replace(/\r\n/g, '\n').split('\n');
    const out = [];
    for (let i = 0; i < rows.length; i++) {
        const m = (rows[i] ?? '').match(/^!\[[^\]]*\]\(([^)]+?)\)\s*$/);
        if (!m)
            continue;
        const src = (m[1] ?? '').replace(/\s+["'].*["']\s*$/, '').trim();
        let j = i + 1;
        while (j < rows.length && (rows[j] ?? '').trim() === '')
            j++;
        const next = (rows[j] ?? '').trim();
        const caption = isCaption(next) ? captionText(next) : undefined;
        out.push(caption ? { src, caption } : { src });
    }
    return out;
}
/** Render GitHub markdown tables to HTML tables; WeChat needs them as images instead. */
function renderTable(block) {
    const cells = (row) => row.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
    const head = cells(block[0] ?? '');
    const body = block.slice(2).map(cells);
    const th = head.map(h => `<th style="border:1px solid #ddd;padding:6px 10px;background:${ACCENT_SOFT}">${esc(h)}</th>`).join('');
    const trs = body.map(r => `<tr>${r.map(c => `<td style="border:1px solid #ddd;padding:6px 10px">${esc(c)}</td>`).join('')}</tr>`).join('');
    return { html: `<table style="border-collapse:collapse;width:100%;margin:1em 0"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`, isTable: true };
}
/** Convert markdown to inline-styled WeChat HTML, grouping figures with their captions. */
function toWechatHtml(md) {
    const blocks = md.replace(/\r\n/g, '\n').split(/\n{2,}/);
    const out = [];
    for (let i = 0; i < blocks.length; i++) {
        const rows = (blocks[i] ?? '').split('\n');
        const first = rows[0] ?? '';
        const second = rows[1] ?? '';
        // Figure: a lone image line, optionally followed by a lone italic caption block.
        const img = standaloneImage(rows);
        if (img !== null) {
            const next = (blocks[i + 1] ?? '').trim();
            if (next && !next.includes('\n') && isCaption(next)) {
                out.push(`<figure style="margin:1.2em 0;text-align:center">${imgTag(img)}`
                    + `<figcaption style="font-style:italic;color:${MUTED};font-size:14px;line-height:1.6;margin:6px 0 0">${esc(captionText(next))}</figcaption></figure>`);
                i++;
                continue;
            }
            out.push(imgTag(img));
            continue;
        }
        if (rows.length >= 2 && /^\s*\|/.test(first) && /^\s*\|[\s:|-]+\|/.test(second)) {
            out.push(renderTable(rows).html);
            continue;
        }
        if (rows.length === 1 && /^\s*([-*_])\s*(\1\s*){2,}$/.test(first)) {
            out.push(`<hr style="border:none;border-top:1px solid #e6e8eb;margin:1.6em 0">`);
            continue;
        }
        const heading = first.match(/^(#{1,4})\s+(.*)$/);
        if (heading && rows.length === 1) {
            const level = (heading[1] ?? '').length;
            const text = inline(heading[2] ?? '', true);
            const base = `margin:1.4em 0 0.6em;font-weight:700;color:${TEXT}`;
            if (level === 1)
                out.push(`<h1 style="${base};font-size:22px">${text}</h1>`);
            else if (level === 2)
                out.push(`<h2 style="${base};font-size:19px;border-left:4px solid ${ACCENT};padding-left:10px">${text}</h2>`);
            else
                out.push(`<h3 style="${base};font-size:17px">${text}</h3>`);
            continue;
        }
        if (rows.every(r => r.startsWith('>'))) {
            const inner = rows.map(r => inline(r.replace(/^>\s?/, ''), true)).join('<br>');
            out.push(`<blockquote style="border-left:3px solid ${ACCENT};background:${ACCENT_SOFT};color:#4a4f57;margin:1em 0;padding:8px 14px;border-radius:4px">${inner}</blockquote>`);
            continue;
        }
        if (rows.every(r => /^[-*]\s+/.test(r))) {
            const items = rows.map(r => `<li style="margin:4px 0">${inline(r.replace(/^[-*]\s+/, ''), true)}</li>`).join('');
            out.push(`<ul style="padding-left:1.4em;color:${TEXT};line-height:1.75">${items}</ul>`);
            continue;
        }
        if (rows.every(r => /^\d+[.)]\s+/.test(r))) {
            const items = rows.map(r => `<li style="margin:4px 0">${inline(r.replace(/^\d+[.)]\s+/, ''), true)}</li>`).join('');
            out.push(`<ol style="padding-left:1.5em;color:${TEXT};line-height:1.75">${items}</ol>`);
            continue;
        }
        const joined = inline(rows.join('<br>'), true);
        out.push(`<p style="margin:0.9em 0;line-height:1.8;color:${TEXT};font-size:16px">${joined}</p>`);
    }
    return out.join('\n');
}
/** Split markdown into X posts, keeping each figure as a media post with its caption. */
function toXThread(md) {
    const capOf = new Map(collectImages(md).filter(im => im.caption).map(im => [im.src, im.caption]));
    const blocks = md.replace(/\r\n/g, '\n').split(/\n{2,}/);
    const posts = [];
    for (const block of blocks) {
        const rows = block.split('\n');
        const img = standaloneImage(rows);
        if (img !== null) {
            const cap = capOf.get(img);
            posts.push(`📎 配图 ${img}${cap ? `：${cap}` : ''}`);
            continue;
        }
        const text = rows.join(' ')
            .replace(/^#{1,4}\s+/, '')
            .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
            .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
            .replace(/[*_`>]/g, '')
            .trim();
        if (!text)
            continue;
        let rest = text;
        while (rest.length > 270) {
            let cut = rest.lastIndexOf(' ', 270);
            if (cut < 100) {
                const stop = rest.search(/[。！？.!?]\s*/);
                cut = stop < 0 ? 270 : stop + 1;
            }
            posts.push(rest.slice(0, cut).trim());
            rest = rest.slice(cut).trim();
        }
        if (rest)
            posts.push(rest);
    }
    return posts.map((p, i) => `${i + 1}/${posts.length} ${p}`);
}
/** 小红书：标题 + 正文要点 + 按序配图清单（图文混排，图片不丢弃）。 */
function toXiaohongshu(md) {
    const title = md.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? '';
    const points = [...md.matchAll(/^[-*]\s+(.+)$|^\d+[.)]\s+(.+)$/gm)].map(m => (m[1] ?? m[2] ?? '').trim()).filter(Boolean);
    const imgs = collectImages(md);
    const body = points.length
        ? points.slice(0, 8).map(p => `🔸 ${p}`).join('\n')
        : md.replace(/[#*>`]/g, '').replace(/!\[[^\]]*\]\([^)]*\)/g, '').trim().slice(0, 800);
    const figBlock = imgs.length
        ? `\n\n【配图 ${imgs.length} 张·按序上传】\n` + imgs.map((im, idx) => `${idx + 1}. ${im.src}${im.caption ? `｜${im.caption}` : ''}`).join('\n')
        : '';
    return `${title}\n\n${body}${figBlock}`;
}
/** Wrap markdown with blog front-matter, keeping the source as the body. */
function toBlog(md) {
    const title = md.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? 'Untitled';
    return `---\ntitle: ${title}\ndraft: true\n---\n\n${md}`;
}
/**
 * Format one markdown draft for a channel.
 * @param md - raw markdown draft.
 * @param platform - target channel.
 * @returns the {@link FormattedOutput} body plus adapter follow-up notes.
 */
export function format(md, platform) {
    const images = collectImages(md).map(im => im.src);
    switch (platform) {
        case 'wechat': {
            const inner = toWechatHtml(md);
            const content = `<section style="font-family:-apple-system,'PingFang SC','Microsoft YaHei',sans-serif;line-height:1.8;color:${TEXT};word-break:break-word">${inner}</section>`;
            const notes = [];
            if (inner.includes('<table')) {
                notes.push('正文含表格：微信草稿不渲染 <table>，发布前用 render 工具把每张表转成 PNG 再替换。');
            }
            if (/<img class="rich_pages/.test(inner)) {
                notes.push('正文图片用了微信规范标签但 data-ratio/data-w 仍为 0：adapter 上传取真实宽高后回填，否则编辑器可能不显示。');
            }
            return { platform, content, images, notes };
        }
        case 'zhihu':
            return { platform, content: md, images, notes: ['知乎支持 Markdown 表格与图片链接，成稿可直接粘贴；本地图片（见 images）建议先转 https 图床。'] };
        case 'x':
            return { platform, content: toXThread(md).join('\n\n---\n\n'), images, notes: [`已按 ≤280 字切分为 thread，逐条发布。${images.length ? `其中 ${images.length} 条为配图推文，按 images 顺序附对应文件。` : ''}`] };
        case 'xiaohongshu':
            return { platform, content: toXiaohongshu(md), images, notes: [images.length ? `已按图文混排整理：正文要点 + ${images.length} 张配图按序列出（见 images）；封面从配图另选或补白。` : '已压缩为小红书短笔记；建议补 1–3 张配图。'] };
        case 'blog':
            return { platform, content: toBlog(md), images, notes: ['已加 front-matter，draft: true，发布前改为 false。', images.length ? `引用本地图片 ${images.length} 张（见 images），发布前拷入站点静态目录。` : ''] };
    }
}
