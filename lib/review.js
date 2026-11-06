/**
 * Deterministic draft review: wording red lines, layout rules and length budgets that the
 * perceptive-gap methodology demands. Pure string analysis — no filesystem, network or model.
 * @module dsh-ip-studio/review
 */
/** Target publishing channels; each carries its own hard layout rule. */
export const PLATFORMS = ['wechat', 'zhihu', 'xiaohongshu', 'x', 'blog'];
/** Narrow an untrusted platform string, defaulting to WeChat. */
export function asPlatform(value) {
    return PLATFORMS.includes(value) ? value : 'wechat';
}
/** Terms that must never describe the author's own content (methodology wording red lines). */
const BANNED = [
    { pattern: /偏见/, rule: 'banned-bias-word', message: '不要用「偏见」形容自己的内容；改用「观点 / 判断 / 独立视角」。' },
    { pattern: /我的(观点|判断|看法)/, rule: 'owned-claim', message: '少用「我的观点 / 我的判断」；改用「核心观点 / 一个判断 / 本文看来」。' },
    { pattern: /欢迎来杠|来杠|不服来战/, rule: 'confrontational-ending', message: '结尾不要用对抗式；改用邀请式「欢迎在评论区一起交流探讨」。' },
    { pattern: /评论家|作为一个评论者/, rule: 'commentator-stance', message: '不要自称「评论者 / 评论家」；以学习者 + 分析师口吻写作。' },
    { pattern: /UsefulAI/, rule: 'legacy-brand', message: '署名统一「实用AI」，不再使用旧称 UsefulAI。' },
];
/** Split markdown into physical lines once so every rule shares 1-based numbering. */
function lines(md) {
    return md.split(/\r?\n/);
}
/** Count CJK ideographs, the length budget basis for Chinese long-form. */
function chineseCharCount(md) {
    const matches = md.match(/[\u3400-\u9FFF\uF900-\uFAFF]/g);
    return matches ? matches.length : 0;
}
/** Extract image reference targets from `![alt](path)` occurrences with their line numbers. */
function imageRefs(md) {
    const out = [];
    const re = /!\[[^\]]*\]\(([^)]*)\)/g;
    let m;
    while ((m = re.exec(md)) !== null) {
        // Strip an optional ` "title"` suffix, but keep internal spaces in the path itself so the
        // ASCII-name rule can see a `Figure 1.png`-style filename.
        const path = (m[1] ?? '').replace(/\s+["'].*["']\s*$/, '').trim();
        out.push({ path, line: md.slice(0, m.index).split(/\r?\n/).length });
    }
    return out;
}
/** First ATX heading text, treated as the title for the length budget. */
function firstHeading(md) {
    const m = md.match(/^#\s+(.+)$/m);
    return m ? (m[1] ?? '').trim() : '';
}
/** Detect a GitHub markdown table: a `|` header row followed by a `|---|` separator row. */
function findTables(md) {
    const rows = lines(md);
    const hits = [];
    for (let i = 0; i < rows.length - 1; i++) {
        if (/^\s*\|.*\|\s*$/.test(rows[i] ?? '') && /^\s*\|[\s:|-]+\|\s*$/.test(rows[i + 1] ?? ''))
            hits.push(i + 1);
    }
    return hits;
}
/**
 * Review one draft against the methodology for a target platform.
 * @param md - the raw markdown draft.
 * @param platform - intended publishing channel.
 * @returns the structured {@link ReviewReport}.
 */
export function reviewDraft(md, platform) {
    const findings = [];
    const rows = lines(md);
    for (const { pattern, rule, message } of BANNED) {
        const hits = [];
        rows.forEach((line, i) => {
            if (pattern.test(line))
                hits.push(i + 1);
        });
        if (hits.length)
            findings.push({ rule, severity: 'blocker', message, lines: hits });
    }
    const tables = findTables(md);
    if (tables.length) {
        findings.push({
            rule: 'markdown-table',
            severity: platform === 'wechat' ? 'blocker' : 'warn',
            message: platform === 'wechat'
                ? '微信草稿不渲染 Markdown 表格：把这些表转成 PNG 再贴图。'
                : '建议将数据表格转成图片，跨端渲染更稳。',
            lines: tables,
        });
    }
    const refs = imageRefs(md);
    const badNames = refs.filter(r => !/^https?:/i.test(r.path) && /[\s%]/.test(r.path));
    if (badNames.length) {
        findings.push({
            rule: 'image-name-ascii',
            severity: 'blocker',
            message: '图片文件名须为 ASCII、无空格、无 URL 编码；发布按字面路径打开，空格名会静默变缺图。',
            lines: badNames.map(r => r.line),
        });
    }
    if (refs.length > 12) {
        findings.push({
            rule: 'image-count-readability',
            severity: 'warn',
            message: `正文 ${refs.length} 张图，超出移动端 ≤10–12 张建议；提醒读者或提供精简版。`,
            lines: [],
        });
    }
    const titleLength = firstHeading(md).length;
    if (titleLength === 0) {
        findings.push({ rule: 'missing-title', severity: 'blocker', message: '缺少一级标题（# …）作为文章标题。', lines: [] });
    }
    else if (titleLength > 64) {
        findings.push({ rule: 'title-too-long', severity: 'blocker', message: `标题 ${titleLength} 字，超过 64 字上限。`, lines: [1] });
    }
    const chineseChars = chineseCharCount(md);
    const budget = platform === 'xiaohongshu' || platform === 'x'
        ? { min: 0, max: 2000, label: '短内容平台' }
        : { min: 2500, max: 5000, label: '长文' };
    if (platform !== 'xiaohongshu' && platform !== 'x' && chineseChars < budget.min) {
        findings.push({
            rule: 'length-under-budget',
            severity: 'warn',
            message: `正文约 ${chineseChars} 中文字，低于 ${budget.label} 建议下限 ${budget.min}；确认认知差是否摊开。`,
            lines: [],
        });
    }
    const publishable = !findings.some(f => f.severity === 'blocker');
    return { platform, chineseChars, imageCount: refs.length, titleLength, findings, publishable };
}
