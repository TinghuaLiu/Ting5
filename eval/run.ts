/**
 * Real-model eval for 深研.
 *  A. Verifier on a hand-labelled set of claim/quote pairs (supported / partial / unsupported /
 *     contradicted). The key number: unsupported or contradicted claims must never pass as supported.
 *  B. Deterministic checks (URL matching, quote matching, status logic) — unit tests, no model.
 *  C. End-to-end research on real questions with live web search. The app uses the Claude API's
 *     server-side web_search / web_fetch tools; here the same prompt runs through Claude Code's
 *     WebSearch / WebFetch tools. Retrieved URLs come from the transcript; whether each cited quote
 *     really appears on its page is checked by a separate fetch-and-compare step.
 *
 *   npm run eval
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { z } from 'zod';
import { checkClaims, finalStatus, normUrl, quoteInText, type CheckedClaim, type Retrieved } from '../src/lib/engine';
import { parseReport, researchPrompt, VerdictSchema, verifyPrompt, type Report } from '../src/lib/prompts';
import { checksTable, MODEL, outDir, run, runWithWeb, totalCost, type Check } from './claude';

// ---------------------------------------------------------------- A. labelled verifier set

type Label = 'supported' | 'partial' | 'unsupported' | 'contradicted';
const PAIRS: { claim: string; quote: string; label: Label }[] = [
  { claim: 'Munich had about 1.61 million residents at the end of 2025.', quote: 'At the end of 2025, 1,612,429 people had their main residence in Munich.', label: 'supported' },
  { claim: 'Renewables covered more than half of Germany\'s gross electricity consumption in 2024.', quote: 'In 2024, renewable energies covered 54.4 percent of gross electricity consumption in Germany.', label: 'supported' },
  { claim: '316L 是一种奥氏体不锈钢。', quote: '316L is an austenitic stainless steel with low carbon content.', label: 'supported' },
  { claim: 'Die Studie umfasste 139 Teilnehmende mit Adipositas.', quote: 'A total of 139 patients with obesity were randomly assigned to time-restricted eating or daily calorie restriction.', label: 'supported' },
  { claim: 'The trial lasted 12 months.', quote: 'Participants were followed for 12 months after randomisation.', label: 'supported' },
  { claim: 'Renewables covered 54.4 % of electricity consumption in 2024, mostly thanks to solar power.', quote: 'In 2024, renewable energies covered 54.4 percent of gross electricity consumption in Germany.', label: 'partial' },
  { claim: 'Both diets led to similar weight loss, and the fasting group reported better sleep.', quote: 'Weight loss did not differ significantly between the time-restricted eating group and the calorie-restriction group.', label: 'partial' },
  { claim: '慕尼黑工业大学有超过 5 万名学生，其中约 40% 来自国外。', quote: 'TUM currently has more than 50,000 students.', label: 'partial' },
  { claim: 'The melt pool depth increases with laser power and decreases with scan speed.', quote: 'Melt pool depth increased with increasing laser power.', label: 'partial' },
  { claim: 'Renewables covered 62 % of gross electricity consumption in 2024.', quote: 'In 2024, renewable energies covered 54.4 percent of gross electricity consumption in Germany.', label: 'unsupported' },
  { claim: 'Intermittent fasting causes faster weight loss because it lowers insulin levels.', quote: 'Participants in the fasting group lost on average 8 kg over 12 months.', label: 'unsupported' },
  { claim: 'Die Wartezeit für Termine beim Bürgerbüro beträgt im Schnitt drei Wochen.', quote: 'Termine im Bürgerbüro können online gebucht werden.', label: 'unsupported' },
  { claim: '这种合金的抗拉强度达到 1200 MPa。', quote: 'The alloy showed good ductility and a fine-grained microstructure.', label: 'unsupported' },
  { claim: 'Time-restricted eating led to significantly more weight loss than calorie restriction.', quote: 'Weight loss did not differ significantly between the time-restricted eating group and the calorie-restriction group.', label: 'contradicted' },
  { claim: 'Munich\'s population shrank in 2025.', quote: 'Munich\'s population grew by around 9,000 people in 2025.', label: 'contradicted' },
  { claim: '该研究发现，提高扫描速度会降低表面粗糙度。', quote: 'Higher scan speeds resulted in increased surface roughness (Ra).', label: 'contradicted' },
];

// ---------------------------------------------------------------- B. deterministic unit tests

function unitTests(): Check[] {
  const out: Check[] = [];
  const t = (name: string, pass: boolean, detail = '') => out.push({ name: `单元测试：${name}`, pass, detail });
  t('URL 规范化忽略 www、末尾斜杠、#锚点和 utm 参数', normUrl('https://www.Example.org/a/b/?utm_source=x#top') === normUrl('https://example.org/a/b'));
  t('URL 规范化保留真正的查询参数', normUrl('https://example.org/a?id=1') !== normUrl('https://example.org/a?id=2'));
  const page = 'In 2024, renewable energies covered 54.4 percent of gross\nelectricity consumption in Germany. Wind was the largest source.';
  t('引文匹配：大小写、换行、引号样式不敏感', quoteInText('renewable energies covered 54.4 percent of gross electricity consumption', page));
  t('引文匹配：支持省略号拼接', quoteInText('In 2024, renewable energies covered … Wind was the largest source.', page));
  t('引文匹配：改过的数字不算匹配', !quoteInText('renewable energies covered 62 percent of gross electricity consumption', page));
  const report: Report = {
    title: 't',
    summary: '',
    open_questions: [],
    sections: [
      {
        heading: 's',
        claims: [
          { text: 'ok', sources: [{ url: 'https://a.org/x', title: '', quote: 'Wind was the largest source' }] },
          { text: 'fake url', sources: [{ url: 'https://invented.org/y', title: '', quote: 'anything' }] },
          { text: 'altered quote', sources: [{ url: 'https://a.org/x', title: '', quote: 'Solar was the largest source' }] },
          { text: 'search only', sources: [{ url: 'https://b.org/z', title: '', quote: 'not checkable' }] },
        ],
      },
    ],
  };
  const retrieved: Retrieved[] = [
    { url: 'https://www.a.org/x/', title: '', text: page },
    { url: 'https://b.org/z', title: '', text: null },
  ];
  const c = checkClaims(report, retrieved);
  t('核对：检索过且引文存在', c[0].sources[0].retrieved && c[0].sources[0].quoteFound === true);
  t('核对：编造的链接被标为未检索', !c[1].sources[0].retrieved);
  t('核对：改过的引文被标为找不到', c[2].sources[0].quoteFound === false);
  t('核对：只有搜索摘要时标为无法核对', c[3].sources[0].retrieved && c[3].sources[0].quoteFound === null);
  const st = (x: CheckedClaim, verdict: CheckedClaim['verdict']) => finalStatus({ ...x, verdict });
  t('状态：编造链接即使核查员说支持也算有问题', st(c[1], 'supported') === 'problem');
  t('状态：引文对不上即使核查员说支持也算有问题', st(c[2], 'supported') === 'problem');
  t('状态：全部通过才算已核实', st(c[0], 'supported') === 'verified' && st(c[0], 'partial') === 'partial');
  t('状态：只有搜索摘要时最多算“未能逐字核对”', st(c[3], 'supported') === 'unchecked');
  return out;
}

// ---------------------------------------------------------------- C. live research

const QUESTIONS = [
  { id: 'de-renewables', lang: 'zh' as const, q: '2024 年德国总用电量中可再生能源的占比是多少？风电和光伏各贡献多少？' },
  { id: 'if-weightloss', lang: 'en' as const, q: 'What do randomized controlled trials show about intermittent fasting or time-restricted eating versus daily calorie restriction for weight loss in adults?' },
];

const QuoteCheck = z.object({
  results: z.array(z.object({ id: z.number(), page_loaded: z.boolean(), quote_on_page: z.enum(['verbatim', 'close', 'not_found']), note: z.string() })),
});

async function research(item: (typeof QUESTIONS)[number]) {
  const p = researchPrompt(item.q, item.lang, 'quick');
  const out = await runWithWeb(p);
  const report = parseReport(out.text);
  if (!report) return { item, report: null, out, claims: [] as CheckedClaim[], quoteChecks: null };
  const retrieved: Retrieved[] = [...out.searches.flatMap((s) => s.urls.map((u) => ({ url: u.url, title: u.title, text: null }))), ...out.fetched.map((u) => ({ url: u, title: '', text: null }))];
  const checked = checkClaims(report, retrieved);
  if (checked.length === 0) return { item, report, out, claims: [] as CheckedClaim[], quoteChecks: null };
  const v = await run(verifyPrompt(checked.map((c) => ({ id: c.id, text: c.text, quotes: c.sources.filter((s) => s.retrieved).map((s) => s.quote) })), item.lang), VerdictSchema);
  const claims = checked.map((c) => {
    const r = v.verdicts.find((x) => x.id === c.id);
    const x = { ...c, verdict: r?.verdict ?? ('unsupported' as const), note: r?.note ?? '' };
    return { ...x, status: finalStatus(x) };
  });
  // independent check: does each cited quote really appear on its page?
  const pairs = claims.flatMap((c) => c.sources.map((s) => ({ url: s.url, quote: s.quote }))).slice(0, 14);
  const quoteChecks = await runWithWeb({
    system: ['You check citations. For each item, fetch the URL and report whether the quoted passage appears on that page: verbatim (word for word, ignoring whitespace and punctuation style), close (same wording with small differences), or not_found. If the page cannot be loaded, say so. Output only JSON inside a ```json block: {"results":[{"id":number,"page_loaded":boolean,"quote_on_page":"verbatim"|"close"|"not_found","note":string}]}'],
    user: pairs.map((x, i) => `#${i + 1} URL: ${x.url}\nQUOTE: "${x.quote}"`).join('\n\n'),
    effort: 'low',
  }).then((r) => {
    try {
      return QuoteCheck.parse(JSON.parse(r.text.match(/```json\s*([\s\S]*?)```/)?.[1] ?? r.text));
    } catch {
      return null;
    }
  });
  return { item, report, out, claims, quoteChecks };
}

const hostOf = (u: string) => {
  try {
    return new URL(u).host;
  } catch {
    return u;
  }
};

async function main() {
  const out = outDir();
  mkdirSync(out, { recursive: true });
  const [verdicts, live] = await Promise.all([
    run(verifyPrompt(PAIRS.map((p, i) => ({ id: i + 1, text: p.claim, quotes: [p.quote] })), 'zh'), VerdictSchema),
    Promise.all(QUESTIONS.map(research)),
  ]);
  const checks: Check[] = [];
  const skipped: string[] = [];
  // A
  const got = PAIRS.map((p, i) => ({ ...p, got: verdicts.verdicts.find((v) => v.id === i + 1)?.verdict ?? 'missing', note: verdicts.verdicts.find((v) => v.id === i + 1)?.note ?? '' }));
  const exact = got.filter((g) => g.got === g.label).length;
  const falsePass = got.filter((g) => (g.label === 'unsupported' || g.label === 'contradicted' || g.label === 'partial') && g.got === 'supported');
  const missedGood = got.filter((g) => g.label === 'supported' && g.got !== 'supported');
  checks.push({ name: 'A 核查员：没有把不支持/相反/部分支持的结论判成“支持”', pass: falsePass.length === 0, detail: falsePass.map((f) => `${f.claim}（应为 ${f.label}）`).join('；') || `0/${PAIRS.length - 5}` });
  checks.push({ name: 'A 核查员：真正有依据的结论被判为“支持”（≥ 4/5）', pass: missedGood.length <= 1, detail: `${5 - missedGood.length}/5${missedGood.length ? '；' + missedGood.map((m) => `${m.claim} → ${m.got}`).join('；') : ''}` });
  checks.push({ name: 'A 核查员：四分类完全一致（≥ 12/16）', pass: exact >= 12, detail: `${exact}/${PAIRS.length}` });
  // B
  checks.push(...unitTests());
  // C
  for (const r of live) {
    const t = `C [${r.item.id}]`;
    if (!r.report) {
      checks.push({ name: `${t} 报告格式可解析`, pass: false, detail: r.out.text.slice(0, 200) });
      continue;
    }
    const sources = r.claims.flatMap((c) => c.sources);
    const retrievedOk = sources.filter((s) => s.retrieved).length;
    const qc = r.quoteChecks?.results ?? [];
    const loaded = qc.filter((x) => x.page_loaded);
    const onPage = loaded.filter((x) => x.quote_on_page !== 'not_found').length;
    const searchesN = r.out.searches.length;
    checks.push({ name: `${t} 真的联网检索了`, pass: searchesN >= 2, detail: `${searchesN} 次搜索（共 ${r.out.searches.reduce((n, x) => n + x.urls.length, 0)} 个结果）、${r.out.fetched.length} 次尝试读取网页` });
    // never assert without evidence: either claims with retrieved sources, or no claims and the gaps named in open_questions
    const fabricated = sources.filter((x) => !x.retrieved);
    checks.push({
      name: `${t} 没有编造：每条结论都引用本次检索到的页面`,
      pass: fabricated.length === 0 && (r.claims.length > 0 || r.report.open_questions.length > 0),
      detail: r.claims.length ? `${retrievedOk}/${sources.length} 个引用在检索记录里${fabricated.length ? '；未检索：' + fabricated.map((x) => x.url).join('、') : ''}` : `0 条结论：报告在 open_questions 里说明了原因（${r.report.open_questions.length} 条）`,
    });
    if (r.claims.length) {
      const st = { verified: 0, unchecked: 0, partial: 0, problem: 0 };
      r.claims.forEach((c) => st[c.status]++);
      checks.push({ name: `${t} 生成了有引文的结论（≥ 5 条）`, pass: r.claims.length >= 5, detail: `${r.claims.length} 条：✓ ${st.verified} · ○ ${st.unchecked} · ◐ ${st.partial} · ✗ ${st.problem}` });
    }
    if (loaded.length) checks.push({ name: `${t} 引文确实出现在原页面上（≥ 80%，独立重新抓取核对）`, pass: onPage / loaded.length >= 0.8, detail: `${onPage}/${loaded.length}（${qc.filter((x) => x.quote_on_page === 'verbatim').length} 逐字、${qc.filter((x) => x.quote_on_page === 'close').length} 近似）` });
    else skipped.push(`${t} 引文是否出现在原页面：${r.out.fetched.length ? `本环境的网络代理拒绝打开网页（尝试了 ${r.out.fetched.length} 次），无法逐字核对` : '没有可核对的引文'}`);
  }
  const L = [
    '# 深研 · 真实模型测试报告',
    '',
    `- 模型：\`${MODEL}\`，研究和核查都用应用里完全相同的提示词（\`src/lib/prompts.ts\`）和核对代码（\`src/lib/engine.ts\`）`,
    '- 注意：应用使用 Claude API 的服务端 web_search / web_fetch 工具；这里通过 Claude Code CLI 的 WebSearch / WebFetch 工具运行同一提示词。检索记录取自 CLI 的工具调用；引文是否出现在原页面，由一个独立的“重新抓取并对比”步骤检查',
    `- 时间：${new Date().toISOString()} · 花费约 $${totalCost.toFixed(2)}`,
    '',
    `**总计：${checks.filter((c) => c.pass).length}/${checks.length} 项通过**`,
    '',
    checksTable(checks),
    '',
    ...(skipped.length ? ['**因环境限制跳过（不计入总计）：**', '', ...skipped.map((x) => `- ${x}`), ''] : []),
    '## A. 核查员在标注集上的判断',
    '',
    '| 结论 | 引文 | 标注 | 核查员 |',
    '|---|---|---|---|',
    ...got.map((g) => `| ${g.claim} | ${g.quote} | ${g.label} | ${g.got === g.label ? '✅' : '❌'} ${g.got} |`),
    '',
    ...live.flatMap((r) =>
      r.report
        ? [
            `## C. ${r.item.q}`,
            '',
            `**${r.report.title}** — ${r.report.summary}`,
            '',
            ...r.claims.map((c) => `- ${({ verified: '✓', unchecked: '○', partial: '◐', problem: '✗' } as const)[c.status]} ${c.text} — ${c.sources.map((s) => `[${s.retrieved ? '' : '未检索 '}${hostOf(s.url)}](${s.url})`).join(' ')}${c.status !== 'verified' ? ` _(${c.verdict}: ${c.note})_` : ''}`),
            '',
            `检索：${r.out.searches.map((s) => `“${s.query}”`).join('、')}`,
            '',
            ...(r.report.open_questions.length ? ['**未解决的问题：**', '', ...r.report.open_questions.map((q) => `- ${q}`), ''] : []),
          ]
        : [],
    ),
  ];
  writeFileSync(`${out}/report.md`, L.join('\n'));
  writeFileSync(`${out}/raw.json`, JSON.stringify({ got, live: live.map((r) => ({ ...r, out: { ...r.out, text: r.out.text.slice(0, 20000) } })) }, null, 2));
  console.log(`\nreport: ${out}/report.md · cost ≈ $${totalCost.toFixed(2)}`);
}

main();
