/**
 * Estimates how much of the learner's explanation is lifted verbatim from the source.
 * Returns the "own words" ratio in [0,1] (1 = fully own words).
 * CJK text is shingled by characters, Latin text by words.
 */
const CJK = /[぀-ヿ㐀-鿿豈-﫿]/;

function shingles(text: string): string[] {
  const norm = text.toLowerCase().replace(/\s+/g, ' ').trim();
  const out: string[] = [];
  const cjkChars = (norm.match(new RegExp(CJK.source, 'g')) || []).length;
  if (cjkChars > norm.length * 0.3) {
    const chars = norm.replace(/[\s\p{P}]/gu, '');
    const k = 8;
    for (let i = 0; i + k <= chars.length; i++) out.push(chars.slice(i, i + k));
  } else {
    const words = norm.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
    const k = 6;
    for (let i = 0; i + k <= words.length; i++) out.push(words.slice(i, i + k).join(' '));
  }
  return out;
}

export function ownWordsRatio(explanation: string, sources: string[]): number {
  const mine = shingles(explanation);
  if (mine.length === 0) return 1;
  const src = new Set(sources.flatMap(shingles));
  if (src.size === 0) return 1;
  let hit = 0;
  for (const s of mine) if (src.has(s)) hit++;
  return Math.max(0, 1 - hit / mine.length);
}
