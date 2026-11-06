/**
 * Deterministic Markdown to per-channel formatting. No network, no image upload, no model:
 * it rewrites structure and encodes the channel-specific tags that make a draft render, and
 * returns notes about the steps that stay with the external publish adapter.
 * @module dsh-ip-studio/formatters
 */
import type { Platform } from './review.ts';
/** Result of formatting one draft for one channel. */
export interface FormattedOutput {
    platform: Platform;
    /** The formatted body: HTML for web channels, text/markdown otherwise. */
    content: string;
    /** Follow-up steps the adapter or author must still do; empty when the output is final. */
    notes: string[];
}
/**
 * Format one markdown draft for a channel.
 * @param md - raw markdown draft.
 * @param platform - target channel.
 * @returns the {@link FormattedOutput} body plus adapter follow-up notes.
 */
export declare function format(md: string, platform: Platform): FormattedOutput;
