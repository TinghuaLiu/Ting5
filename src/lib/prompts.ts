/**
 * Prompts and schemas for 深研. Pure, shared with the eval harness.
 */
import { z } from 'zod';
import { LANG_NAME, type Lang, type Prompt } from '../base/claude';

export const ReportSchema = z.object({
  title: z.string(),
  summary: z.string().describe('3-5 sentence answer to the question'),
  sections: z.array(
    z.object({
      heading: z.string(),
      claims: z.array(
        z.object({
          text: z.string().describe('one factual statement, 1-2 sentences'),
          sources: z.array(
            z.object({
              url: z.string(),
              title: z.string(),
              quote: z.string().describe('a short passage copied word for word from that page, which supports the statement'),
            }),
          ),
        }),
      ),
    }),
  ),
  open_questions: z.array(z.string()).describe('what the sources could not settle, or where they disagree'),
});
export type Report = z.infer<typeof ReportSchema>;

export function researchPrompt(question: string, lang: Lang, depth: 'quick' | 'deep'): Prompt {
  const budget = depth === 'deep' ? 'Use roughly 6-10 searches and read the most important pages in full.' : 'Use roughly 3-5 searches and read the 2-4 most important pages in full.';
  return {
    system: [
      `You are a careful research assistant. Search the web, read the best sources, and answer the user's question in a report where every factual statement is backed by a quotation from a source you retrieved in this session.

How to research:
- ${budget}
- Prefer primary and authoritative sources (official statistics, peer-reviewed papers, standards, documentation, reputable institutions) over blogs and aggregators. Note publication dates; prefer recent data when the question is time-sensitive.
- When sources disagree, report the disagreement instead of picking one silently.

How to write the report:
- Split it into short sections of atomic claims. Each claim is one statement a reader could check.
- For every claim give the URL and title of a page you retrieved in this session — a page you read in full, or a search result — and a short quote copied word for word from text you actually saw from that page. Prefer pages you read in full: their quotes can be checked word for word, search snippets cannot. Never cite a page you did not retrieve, never invent or "tidy up" a quote, and never state a number the quote does not contain.
- If you cannot find support for something, don't include it as a claim — put it in open_questions.

Write the title, summary, headings, claims and open questions in ${LANG_NAME[lang]}; quotes stay in the source's language.

When you are done researching, output only the report as a single JSON object inside a \`\`\`json code block, with this shape:
{"title": string, "summary": string, "sections": [{"heading": string, "claims": [{"text": string, "sources": [{"url": string, "title": string, "quote": string}]}]}], "open_questions": [string]}`,
    ],
    user: question,
    effort: 'high',
  };
}

/** Pulls the JSON report out of the final text (code block, or the outermost braces as a fallback). */
export function parseReport(text: string): Report | null {
  const block = text.match(/```json\s*([\s\S]*?)```/i)?.[1] ?? text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
  try {
    const r = ReportSchema.safeParse(JSON.parse(block));
    return r.success ? r.data : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- verification

export const VerdictSchema = z.object({
  verdicts: z.array(
    z.object({
      id: z.number(),
      verdict: z.enum(['supported', 'partial', 'unsupported', 'contradicted']).describe('supported: the quotes fully back the claim, including every number and qualifier; partial: they back part of it or a weaker version; unsupported: they do not back it; contradicted: they say the opposite'),
      note: z.string().describe('one sentence: what exactly is or is not backed'),
    }),
  ),
});
export type Verdicts = z.infer<typeof VerdictSchema>;

export function verifyPrompt(claims: { id: number; text: string; quotes: string[] }[], lang: Lang): Prompt {
  return {
    system: [
      `You are an independent fact-checker. For each claim you see only the quotes its author cited. Decide whether those quotes, on their own, support the claim. Be literal: a claim with a number, date, comparison or causal word ("because", "leads to") is only supported if the quotes contain it. Do not use your own knowledge to fill gaps — if the quotes don't say it, it is not supported. Write the notes in ${LANG_NAME[lang]}.`,
    ],
    user: claims.map((c) => `#${c.id} CLAIM: ${c.text}\n${c.quotes.map((q) => `  QUOTE: "${q}"`).join('\n') || '  (no quote)'}`).join('\n\n'),
    effort: 'medium',
  };
}
