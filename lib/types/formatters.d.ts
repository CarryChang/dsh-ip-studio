/**
 * Deterministic Markdown to per-channel formatting. No network, no image upload, no model:
 * it rewrites structure, encodes the channel-specific tags that make a draft render, themes the
 * output from a brand palette, auto-fills placeholder captions and rename hints for figures, and
 * returns notes about the steps that stay with the external publish adapter.
 * @module dsh-ip-studio/formatters
 */
import type { Platform } from './review.ts';
/** Brand palette for themed output; mirrors config/publish.example.json's `brand`. */
export interface Brand {
    name: string;
    accent: string;
    accentSoft: string;
    text: string;
    muted: string;
}
/** Default 实用AI palette; callers override per deployment via the `brand` argument. */
export declare const DEFAULT_BRAND: Brand;
/** Result of formatting one draft for one channel. */
export interface FormattedOutput {
    platform: Platform;
    /** The formatted body: HTML for web channels, text/markdown otherwise. */
    content: string;
    /** Ordered ASCII local image files referenced, for the adapter to upload on every channel. */
    images: string[];
    /** Follow-up steps the adapter or author must still do (rename/caption fixes); empty when final. */
    notes: string[];
}
/**
 * Format one markdown draft for a channel.
 * @param md - raw markdown draft.
 * @param platform - target channel.
 * @param brand - optional theme palette override; merged over {@link DEFAULT_BRAND}.
 * @returns the {@link FormattedOutput} body, ordered image list, and adapter follow-up notes.
 */
export declare function format(md: string, platform: Platform, brand?: Partial<Brand>): FormattedOutput;
