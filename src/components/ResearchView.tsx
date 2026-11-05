import { useState } from 'react';
import { normUrl, type CheckedClaim, type Research } from '../lib/engine';

const STATUS: Record<CheckedClaim['status'], [string, string, string]> = {
  verified: ['✓', '已核实', 'good'],
  unchecked: ['○', '未能逐字核对', 'muted'],
  partial: ['◐', '部分支持', 'ok'],
  problem: ['✗', '有问题', 'bad'],
};
const VERDICT: Record<CheckedClaim['verdict'], string> = {
  supported: '引文支持这条结论',
  partial: '引文只支持一部分',
  unsupported: '引文不支持这条结论',
  contradicted: '引文与结论相反',
  pending: '待核对',
};

const host = (u: string) => {
  try {
    return new URL(u).host.replace(/^www\./, '');
  } catch {
    return u;
  }
};

function toMarkdown(r: Research) {
  const L = [`# ${r.report.title}`, '', `> 问题：${r.question}`, '', r.report.summary, ''];
  const urls: string[] = [];
  const ref = (u: string) => (urls.includes(u) ? urls.indexOf(u) : urls.push(u) - 1) + 1;
  let section = '';
  for (const c of r.claims) {
    if (c.section !== section) {
      section = c.section;
      L.push(`## ${section}`, '');
    }
    L.push(`- ${STATUS[c.status][0]} ${c.text} ${c.sources.map((s) => `[${ref(s.url)}]`).join('')}${c.status !== 'verified' ? ` _（${STATUS[c.status][1]}：${c.note}）_` : ''}`);
  }
  if (r.report.open_questions.length) L.push('', '## 未解决的问题', '', ...r.report.open_questions.map((q) => `- ${q}`));
  L.push('', '## 来源', '', ...urls.map((u, i) => `${i + 1}. ${u}`), '', '_✓ 已核实（引文在原页面逐字找到，且支持结论）· ○ 未能逐字核对（只有搜索摘要）· ◐ 部分支持 · ✗ 有问题 —— 由「深研」逐条核对引文得出_');
  return L.join('\n');
}

export function ResearchView({ r, onBack }: { r: Research; onBack: () => void }) {
  const [filter, setFilter] = useState<'all' | CheckedClaim['status']>('all');
  const [open, setOpen] = useState<number | null>(null);
  const n = r.claims.length || 1;
  const count = (s: CheckedClaim['status']) => r.claims.filter((c) => c.status === s).length;
  const shown = r.claims.filter((c) => filter === 'all' || c.status === filter);
  const sections = [...new Set(shown.map((c) => c.section))];
  const cited = new Set(r.claims.flatMap((c) => c.sources.map((s) => normUrl(s.url))));

  const exportMd = () => {
    const blob = new Blob([toMarkdown(r)], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${r.report.title}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <section className="page">
      <button className="link" onClick={onBack}>
        ← 全部研究
      </button>
      {r.demo && <div className="alert soft">这是界面演示：下面的来源是虚构的占位链接（example.org），不是真实文献。填入 API Key 后，深研会真正联网检索。</div>}
      <p className="muted small">问题：{r.question}</p>
      <h1>{r.report.title}</h1>
      <div className="card summary">
        <p>{r.report.summary}</p>
        <div className="meter" aria-label="核对结果">
          <i className="good" style={{ width: `${(count('verified') / n) * 100}%` }} />
          <i className="unchecked" style={{ width: `${(count('unchecked') / n) * 100}%` }} />
          <i className="ok" style={{ width: `${(count('partial') / n) * 100}%` }} />
          <i className="bad" style={{ width: `${(count('problem') / n) * 100}%` }} />
        </div>
        <div className="row stats">
          {(['all', 'verified', 'unchecked', 'partial', 'problem'] as const).map((k) => (
            <button key={k} className={`chip ${filter === k ? 'on' : ''}`} onClick={() => setFilter(k)}>
              {k === 'all' ? `全部 ${r.claims.length}` : `${STATUS[k][0]} ${STATUS[k][1]} ${count(k)}`}
            </button>
          ))}
          <span className="grow" />
          <button className="btn ghost" onClick={exportMd}>
            导出 Markdown
          </button>
        </div>
      </div>

      {sections.map((sec) => (
        <div key={sec} className="sec">
          <h2>{sec}</h2>
          <ul className="list-reset stack">
            {shown
              .filter((c) => c.section === sec)
              .map((c) => (
                <li key={c.id} className={`claim ${c.status}`}>
                  <button className="claim-head" onClick={() => setOpen(open === c.id ? null : c.id)}>
                    <span className={`badge ${STATUS[c.status][2]}`} title={STATUS[c.status][1]}>
                      {STATUS[c.status][0]}
                    </span>
                    <span className="grow">{c.text}</span>
                    <span className="muted small">{c.sources.map((s) => host(s.url)).join(' · ')}</span>
                  </button>
                  {open === c.id && (
                    <div className="claim-body">
                      <p className={`verdict ${STATUS[c.status][2]}`}>
                        <b>核查员：</b>
                        {VERDICT[c.verdict]} —— {c.note}
                      </p>
                      {c.sources.map((s, i) => (
                        <div key={i} className="src">
                          <a href={s.url} target="_blank" rel="noreferrer">
                            {s.title || s.url}
                          </a>
                          <div className="row checks">
                            <span className={`pill ${s.retrieved ? 'good' : 'bad'}`}>{s.retrieved ? '本次确实检索到' : '本次没有检索到这个链接'}</span>
                            <span className={`pill ${s.quoteFound === true ? 'good' : s.quoteFound === false ? 'bad' : ''}`}>
                              {s.quoteFound === true ? '引文在原页面中找到' : s.quoteFound === false ? '原页面里找不到这段引文' : '只看了搜索摘要，引文无法逐字核对'}
                            </span>
                          </div>
                          <blockquote>{s.quote}</blockquote>
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              ))}
          </ul>
        </div>
      ))}

      {r.report.open_questions.length > 0 && (
        <div className="card">
          <h3>❓ 来源没能回答 / 有分歧的地方</h3>
          <ul>
            {r.report.open_questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>
      )}

      <details className="card">
        <summary>
          <b>检索过程（{r.steps.length} 步）· 检索到 {r.retrieved.length} 个页面，引用了 {cited.size} 个</b>
        </summary>
        <ol className="small steps">
          {r.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </details>
    </section>
  );
}
