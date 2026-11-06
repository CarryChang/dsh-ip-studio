/**
 * Deterministic cognitive-gap (认知差) outline builder. It seeds the seven-part skeleton with
 * concrete facts scraped from the material (headline numbers, overturned-assumption hints, figure
 * and table mentions, section headings) so the agent fills judgment and a takeaway framework over
 * real candidates instead of a blank page. Pure string analysis: no network, model or filesystem.
 * @module dsh-ip-studio/outline
 */
/** Candidate facts scraped from the material. */
export interface OutlineSeeds {
    numbers: string[];
    pivots: string[];
    figures: string[];
    headings: string[];
}
/** The generated scaffold plus its scraped seeds. */
export interface Outline {
    /** The fill-in-the-blank perceptive-gap markdown skeleton. */
    markdown: string;
    seeds: OutlineSeeds;
}
/**
 * Build the perceptive-gap skeleton from raw material text.
 * @param material - extracted paper/article/notes text (markdown or plain).
 * @param opts.titleHint - optional subject to echo into the title slot.
 * @returns the fill-in skeleton and its scraped seeds.
 */
export declare function buildOutline(material: string, opts?: {
    titleHint?: string;
}): Outline;
