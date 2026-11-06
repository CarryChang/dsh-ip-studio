/**
 * dsh-ip-studio Cordis plugin entry. Contributes the perceptive-gap writing methodology as an
 * embedded skill and registers two deterministic, offline tools: draft review and multi-platform
 * formatting. It opens no network, subprocess or credential surface; publishing stays behind the
 * user's external adapter.
 * @module dsh-ip-studio
 */
import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import { type Platform } from './review.ts';
export declare const name = "ip-studio";
export declare const inject: string[];
/** Deployment configuration for the plugin. */
export interface Config {
    /** Channel assumed when a call omits `platform`. */
    defaultPlatform: Platform;
}
export declare const Config: z<Config>;
/**
 * Register the methodology skill and the review/format tools.
 * @param ctx - registrant context carrying the skill and tool registries.
 * @param config - deployment's default channel choice.
 * @returns when the plugin is ready.
 */
export declare function apply(ctx: Context, config: Config): Promise<void>;
