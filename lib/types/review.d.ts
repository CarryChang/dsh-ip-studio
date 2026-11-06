/**
 * Deterministic draft review: wording red lines, layout rules and length budgets that the
 * perceptive-gap methodology demands. Pure string analysis — no filesystem, network or model.
 * @module dsh-ip-studio/review
 */
/** Target publishing channels; each carries its own hard layout rule. */
export declare const PLATFORMS: readonly ["wechat", "zhihu", "xiaohongshu", "x", "blog"];
/** A supported publishing channel. */
export type Platform = (typeof PLATFORMS)[number];
/** Narrow an untrusted platform string, defaulting to WeChat. */
export declare function asPlatform(value: string): Platform;
/** One red-line or layout violation reported to the model. */
export interface Finding {
    /** Machine-readable rule id, stable across versions. */
    rule: string;
    /** Severity: 'blocker' breaks publishing, 'warn' hurts readability. */
    severity: 'blocker' | 'warn';
    /** One-line, actionable, locale-neutral description of what to change. */
    message: string;
    /** 1-based line numbers where the rule fired, when locatable. */
    lines: number[];
}
/** Full review report for one draft. */
export interface ReviewReport {
    platform: Platform;
    chineseChars: number;
    imageCount: number;
    titleLength: number;
    findings: Finding[];
    /** True when no blocker fired; the draft may proceed to formatting/publishing. */
    publishable: boolean;
}
/**
 * Review one draft against the methodology for a target platform.
 * @param md - the raw markdown draft.
 * @param platform - intended publishing channel.
 * @returns the structured {@link ReviewReport}.
 */
export declare function reviewDraft(md: string, platform: Platform): ReviewReport;
