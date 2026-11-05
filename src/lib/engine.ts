import Anthropic from '@anthropic-ai/sdk';
import type { BetaContentBlock, BetaMessageParam } from '@anthropic-ai/sdk/resources/beta/messages/messages';
import { callJson, RefusalError, toSpec, type Settings } from '../base/claude';
import { parseReport, researchPrompt, VerdictSchema, verifyPrompt, type Report } from './prompts';

export type Depth = 'quick' | 'deep';

export interface Retrieved {
  url: string;
  title: string;
  /** full text for pages read with web_fetch; null for search-result-only pages and PDFs */
  text: string | null;
}

export interface CheckedSource {
  url: string;
  title: string;
  quote: string;
  retrieved: boolean;
  /** true/false when the page text is available, null when it can't be checked locally */
  quoteFound: boolean | null;
}

export interface CheckedClaim {
  id: number;
  section: string;
  text: string;
  sources: CheckedSource[];
  verdict: 'supported' | 'partial' | 'unsupported' | 'contradicted' | 'pending';
  note: string;
  /**
   * overall status shown to the user, combining code checks and the verifier:
   * verified  = quote found verbatim in a page read in full AND the verifier says it supports the claim
   * unchecked = the verifier says the quote supports it, but the quote could not be checked against the page (search snippet only)
   * partial   = the quote supports only part of the claim, or some of its sources failed the checks
   * problem   = no usable source, or the quote does not support / contradicts the claim
   */
  status: 'verified' | 'unchecked' | 'partial' | 'problem';
}

export interface Research {
  id: string;
  createdAt: number;
  question: string;
  depth: Depth;
  report: Report;
  retrieved: Retrieved[];
  claims: CheckedClaim[];
  steps: string[];
  demo?: boolean;
}

// ---------------------------------------------------------------- deterministic checks

export function normUrl(u: string): string {
  try {
    const x = new URL(u.trim());
    x.hash = '';
    for (const k of [...x.searchParams.keys()]) if (/^utm_|^ref$|^fbclid$|^gclid$/i.test(k)) x.searchParams.delete(k);
    return (x.host.replace(/^www\./, '') + x.pathname.replace(/\/+$/, '') + (x.search || '')).toLowerCase();
  } catch {
    return u.trim().toLowerCase();
  }
}

const flat = (s: string) =>
  s
    .toLowerCase()
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[“”„‟«»„]/g, '"')
    .replace(/[‐-―]/g, '-')
    .replace(/[^\p{L}\p{N}%.,'"-]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Is the quote really in the page? Insensitive to case, whitespace, quote styles and dashes; tolerates "…" elisions. */
export function quoteInText(quote: string, text: string): boolean {
  const t = flat(text);
  return quote
    .split(/\s*(?:\.\.\.|…|\[\.\.\.\])\s*/)
    .map(flat)
    .filter((p) => p.length >= 8)
    .every((p) => t.includes(p));
}

/** Code-side checks of every cited source. Pure; shared with the eval harness. */
export function checkClaims(report: Report, retrieved: Retrieved[]): CheckedClaim[] {
  const byUrl = new Map(retrieved.map((r) => [normUrl(r.url), r]));
  let id = 0;
  return report.sections.flatMap((s) =>
    s.claims.map((c) => {
      const sources = c.sources.map((src) => {
        const r = byUrl.get(normUrl(src.url));
        return { url: src.url, title: src.title, quote: src.quote, retrieved: !!r, quoteFound: r?.text ? quoteInText(src.quote, r.text) : null };
      });
      return { id: ++id, section: s.heading, text: c.text, sources, verdict: 'pending' as const, note: '', status: 'problem' as const };
    }),
  );
}

/** Combines code checks and the verifier into the status the reader sees. */
export function finalStatus(c: CheckedClaim): CheckedClaim['status'] {
  if (c.sources.length === 0) return 'problem';
  if (c.sources.every((s) => !s.retrieved || s.quoteFound === false)) return 'problem';
  if (c.verdict === 'unsupported' || c.verdict === 'contradicted') return 'problem';
  if (c.verdict === 'partial' || c.sources.some((s) => !s.retrieved || s.quoteFound === false)) return 'partial';
  if (c.verdict !== 'supported') return 'partial';
  return c.sources.some((s) => s.quoteFound === true) ? 'verified' : 'unchecked';
}

export async function verify(s: Settings, claims: CheckedClaim[]): Promise<CheckedClaim[]> {
  // only quotes that passed the code checks count as evidence
  const input = claims.map((c) => ({ id: c.id, text: c.text, quotes: c.sources.filter((x) => x.retrieved && x.quoteFound !== false).map((x) => x.quote) }));
  const v = await callJson(s, toSpec(verifyPrompt(input, s.lang)), VerdictSchema);
  return claims.map((c) => {
    const r = v.verdicts.find((x) => x.id === c.id);
    const next = { ...c, verdict: r?.verdict ?? ('unsupported' as const), note: r?.note ?? '核查员没有给出结论。' };
    return { ...next, status: finalStatus(next) };
  });
}

// ---------------------------------------------------------------- research with server tools

function collect(blocks: BetaContentBlock[], retrieved: Map<string, Retrieved>, onStep: (s: string) => void) {
  for (const b of blocks) {
    if (b.type === 'server_tool_use') {
      const input = b.input as { query?: string; url?: string };
      if (b.name === 'web_search' && input.query) onStep(`🔎 搜索：${input.query}`);
      if (b.name === 'web_fetch' && input.url) onStep(`📄 阅读：${input.url}`);
    }
    if (b.type === 'web_search_tool_result' && Array.isArray(b.content)) {
      for (const r of b.content) if (!retrieved.has(normUrl(r.url))) retrieved.set(normUrl(r.url), { url: r.url, title: r.title, text: null });
    }
    if (b.type === 'web_fetch_tool_result' && b.content.type === 'web_fetch_result') {
      const doc = b.content.content;
      const text = doc.source.type === 'text' ? doc.source.data : null;
      retrieved.set(normUrl(b.content.url), { url: b.content.url, title: doc.title ?? b.content.url, text });
    }
  }
}

export async function research(s: Settings, question: string, depth: Depth, onStep: (msg: string) => void, signal?: AbortSignal) {
  const client = new Anthropic({ apiKey: s.apiKey, dangerouslyAllowBrowser: true });
  const p = researchPrompt(question, s.lang, depth);
  const spec = toSpec(p);
  const messages: BetaMessageParam[] = [...spec.messages];
  const retrieved = new Map<string, Retrieved>();
  const steps: string[] = [];
  const step = (m: string) => {
    steps.push(m);
    onStep(m);
  };
  const fallbacks = s.model === 'claude-opus-5-5' || s.model === 'claude-sonnet-5-5' ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const } : {};
  let finalText = '';
  for (let round = 0; round < 6; round++) {
    const stream = client.beta.messages.stream(
      {
        model: s.model,
        max_tokens: 32000,
        output_config: { effort: p.effort },
        system: spec.system,
        messages,
        tools: [
          { type: 'web_search_20260209', name: 'web_search', max_uses: depth === 'deep' ? 12 : 6 },
          { type: 'web_fetch_20260209', name: 'web_fetch', max_uses: depth === 'deep' ? 8 : 4, max_content_tokens: 40000 },
        ],
        ...fallbacks,
      },
      { signal },
    );
    stream.on('contentBlock', (b) => collect([b], new Map(), step));
    const msg = await stream.finalMessage();
    if (msg.stop_reason === 'refusal') throw new RefusalError();
    collect(msg.content, retrieved, () => {});
    finalText = msg.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('');
    if (msg.stop_reason !== 'pause_turn') break;
    // long research turns are paused by the API; send the partial turn back to continue
    messages.push({ role: 'assistant', content: msg.content });
    step('…继续研究');
  }
  const report = parseReport(finalText);
  if (!report) throw new Error('没能读出研究报告（模型的输出格式不对）。请重试，或把问题问得更具体一些。');
  step(`✍️ 报告完成：${report.sections.reduce((n, x) => n + x.claims.length, 0)} 条结论，开始逐条核对出处…`);
  const all = [...retrieved.values()];
  const claims = await verify(s, checkClaims(report, all));
  step('✅ 核对完成');
  return { report, retrieved: all, claims, steps };
}
