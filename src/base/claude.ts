/**
 * Thin, shared wrapper around the official Anthropic SDK for browser use with the user's own key.
 * Every app in this family uses the same three call shapes: structured (parse), streamed text, plain text.
 */
import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import type { BetaMessageParam, BetaTextBlockParam } from '@anthropic-ai/sdk/resources/beta/messages/messages';
import type { z } from 'zod';

export type Lang = 'zh' | 'en' | 'de';
export const LANG_NAME: Record<Lang, string> = { zh: 'Simplified Chinese', en: 'English', de: 'German' };
export const LANG_LABEL: Record<Lang, string> = { zh: '中文', en: 'English', de: 'Deutsch' };

export interface Settings {
  apiKey: string;
  model: string;
  lang: Lang;
}
export const DEFAULT_SETTINGS: Settings = { apiKey: '', model: 'claude-opus-5-5', lang: 'zh' };

export const MODELS = [
  { id: 'claude-opus-5-5', label: 'Claude Opus 5.5（默认，最聪明）' },
  { id: 'claude-sonnet-5-5', label: 'Claude Sonnet 5.5（更快更便宜）' },
  { id: 'claude-haiku-5-5', label: 'Claude Haiku 5.5（最快最省）' },
];

type Effort = 'low' | 'medium' | 'high';

const client = (s: Settings) => new Anthropic({ apiKey: s.apiKey, dangerouslyAllowBrowser: true });

/** Server-side refusal fallbacks exist for Opus 5.5 and Sonnet 5.5 on the Claude API. */
const fallbackParams = (model: string) =>
  model === 'claude-opus-5-5' || model === 'claude-sonnet-5-5' ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const } : {};

export class RefusalError extends Error {
  constructor() {
    super('模型拒绝回答这次请求（安全策略）。可以换个说法或换一份材料再试。');
  }
}

export function friendlyError(e: unknown): string {
  if (e instanceof Anthropic.AuthenticationError) return 'API Key 无效或已过期，请到「设置」里检查。';
  if (e instanceof Anthropic.PermissionDeniedError) return '这个 API Key 没有权限使用所选模型。';
  if (e instanceof Anthropic.NotFoundError) return '找不到所选模型，请到「设置」里换一个模型。';
  if (e instanceof Anthropic.RateLimitError) return '请求太频繁或额度用完了，稍等一会儿再试。';
  if (e instanceof Anthropic.BadRequestError) return `请求被拒绝：${e.message}`;
  if (e instanceof Anthropic.InternalServerError) return 'Claude 服务暂时繁忙（5xx），请稍后重试。';
  if (e instanceof Anthropic.APIConnectionError) return '网络连接失败：请检查网络或代理设置。';
  return e instanceof Error ? e.message : String(e);
}

/** Large, stable context (the user's material) goes first with a cache breakpoint. */
export const cached = (text: string): BetaTextBlockParam => ({ type: 'text', text, cache_control: { type: 'ephemeral' } });
export const plain = (text: string): BetaTextBlockParam => ({ type: 'text', text });

export interface CallSpec {
  system: BetaTextBlockParam[];
  messages: BetaMessageParam[];
  effort: Effort;
}

/** Structured output, validated against a zod schema. */
export async function callJson<S extends z.ZodType>(s: Settings, spec: CallSpec, schema: S, maxTokens = 16000): Promise<z.infer<S>> {
  const res = await client(s).beta.messages.parse({
    model: s.model,
    max_tokens: maxTokens,
    output_config: { effort: spec.effort, format: betaZodOutputFormat(schema) },
    system: spec.system,
    messages: spec.messages,
    ...fallbackParams(s.model),
  });
  if (res.stop_reason === 'refusal') throw new RefusalError();
  if (res.parsed_output == null) throw new Error('模型返回的结果无法解析，请重试。');
  return res.parsed_output as z.infer<S>;
}

/** Streamed plain text (chat turns). */
export async function callStream(s: Settings, spec: CallSpec, onText: (d: string) => void, signal?: AbortSignal, maxTokens = 4000): Promise<string> {
  const stream = client(s).beta.messages.stream(
    { model: s.model, max_tokens: maxTokens, output_config: { effort: spec.effort }, system: spec.system, messages: spec.messages, ...fallbackParams(s.model) },
    { signal },
  );
  stream.on('text', onText);
  const final = await stream.finalMessage();
  if (final.stop_reason === 'refusal') throw new RefusalError();
  return final.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('');
}

/**
 * A prompt as plain data, shared by the app and the eval harness:
 * system[0] is the large stable context (cached), the rest are instructions.
 */
export interface Prompt {
  system: string[];
  user: string;
  effort: Effort;
}

export const toSpec = (p: Prompt): CallSpec => ({
  system: p.system.map((t, i) => (i === 0 ? cached(t) : plain(t))),
  messages: [{ role: 'user', content: p.user }],
  effort: p.effort,
});
