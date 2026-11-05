import { useEffect, useRef, useState } from 'react';
import { DEFAULT_SETTINGS, friendlyError, type Settings } from './base/claude';
import { downloadJson, uid, usePersisted } from './base/store';
import { Hero, How, SettingsDialog, Shell } from './base/ui';
import { ResearchView } from './components/ResearchView';
import { demoResearch } from './lib/demo';
import { research, type Depth, type Research } from './lib/engine';

type View = { name: 'home' } | { name: 'research'; id: string };

const EXAMPLES = ['2025 年德国电力消费中可再生能源占比是多少？各类能源分别贡献多少？', '间歇性断食和普通限制热量相比，减重效果有差别吗？看随机对照试验', 'Wie viele Studierende hat die TU München aktuell, und wie hoch ist der Anteil internationaler Studierender?'];

export default function App() {
  const [settings, setSettings] = usePersisted<Settings>('shenyan.settings', DEFAULT_SETTINGS);
  const [items, setItems, storageErr] = usePersisted<Research[]>('shenyan.items', []);
  const [view, setView] = useState<View>({ name: 'home' });
  const [showSettings, setShowSettings] = useState(false);
  const [question, setQuestion] = useState('');
  const [depth, setDepth] = useState<Depth>('quick');
  const [steps, setSteps] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  const upsert = (r: Research) => setItems((xs) => (xs.some((x) => x.id === r.id) ? xs.map((x) => (x.id === r.id ? r : x)) : [r, ...xs]));

  const start = async () => {
    const q = question.trim();
    if (!q) return;
    if (!settings.apiKey) return setShowSettings(true);
    setBusy(true);
    setErr('');
    setSteps([]);
    abort.current = new AbortController();
    try {
      const out = await research(settings, q, depth, (s) => setSteps((x) => [...x, s]), abort.current.signal);
      const r: Research = { id: uid(), createdAt: Date.now(), question: q, depth, ...out };
      upsert(r);
      setQuestion('');
      setView({ name: 'research', id: r.id });
    } catch (e) {
      if (!abort.current.signal.aborted) {
        const m = friendlyError(e);
        setErr(/web_search|web_fetch|tool/i.test(m) ? `${m}（如果提示网页搜索未启用：需要在 Anthropic Console 的组织设置里打开 Web search / Web fetch。）` : m);
      }
    } finally {
      setBusy(false);
    }
  };

  const current = view.name === 'research' ? items.find((x) => x.id === view.id) : undefined;

  return (
    <Shell logo="研" name="深研" tagline="每句话都核对过出处" needsKey={!settings.apiKey} onHome={() => setView({ name: 'home' })} onSettings={() => setShowSettings(true)} storageError={storageErr}>
      {current ? (
        <ResearchView r={current} onBack={() => setView({ name: 'home' })} />
      ) : (
        <section className="page">
          <Hero
            title="AI 查资料，"
            accent="每一句都要对得上出处。"
            actions={
              <button
                className="btn ghost lg"
                onClick={() => {
                  upsert(demoResearch());
                  setView({ name: 'research', id: 'demo' });
                }}
              >
                看界面演示（无需 Key）
              </button>
            }
          >
            <p>
              深研联网搜索、阅读来源，写成一份报告，并且<strong>把报告拆成一条条结论，逐条核对</strong>：引用的链接是不是本次真的检索到了？引文是不是真的出现在那个页面上？
              再由一个<strong>独立的核查员</strong>判断引文是否真的支持这句话。每条结论都会标成 ✓ 已核实、○ 未能逐字核对、◐ 部分支持或 ✗ 有问题。
            </p>
          </Hero>

          <div className="card form">
            <textarea rows={3} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="你想研究什么问题？越具体越好。" disabled={busy} />
            <div className="chips">
              {EXAMPLES.map((x) => (
                <button key={x} className="chip" onClick={() => setQuestion(x)} disabled={busy}>
                  {x.slice(0, 22)}…
                </button>
              ))}
            </div>
            <div className="row">
              <div className="seg">
                <button className={depth === 'quick' ? 'on' : ''} onClick={() => setDepth('quick')} disabled={busy}>
                  快速（约 1–2 分钟）
                </button>
                <button className={depth === 'deep' ? 'on' : ''} onClick={() => setDepth('deep')} disabled={busy}>
                  深入（约 3–6 分钟）
                </button>
              </div>
              <span className="grow" />
              {busy ? (
                <button className="btn ghost" onClick={() => abort.current?.abort()}>
                  停止
                </button>
              ) : (
                <button className="btn primary lg" onClick={start} disabled={!question.trim()}>
                  开始研究 →
                </button>
              )}
            </div>
            {busy && (
              <ol className="live small">
                {steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
                <li>
                  <span className="spinner" /> {steps.length ? '进行中…' : '正在规划检索…'}
                </li>
              </ol>
            )}
            {err && <div className="alert">{err}</div>}
          </div>

          {items.filter((x) => !x.demo).length > 0 && (
            <>
              <h2 className="sub">我的研究</h2>
              <ul className="history list-reset">
                {items
                  .filter((x) => !x.demo)
                  .map((x) => (
                    <li key={x.id}>
                      <button className="history-item" onClick={() => setView({ name: 'research', id: x.id })}>
                        <span className="grow">{x.report.title}</span>
                        <span className="muted small">
                          ✓ {x.claims.filter((c) => c.status === 'verified').length}/{x.claims.length}
                        </span>
                      </button>
                    </li>
                  ))}
              </ul>
            </>
          )}

          <How
            items={[
              ['真的去查', '用 Claude 的网页搜索和网页读取工具检索、阅读来源，优先官方统计、论文和权威机构。'],
              ['链接必须是真的', '报告里引用的每个链接，都要在本次检索记录里出现过；凭空编造的链接会被标出来。'],
              ['引文必须对得上', '读过全文的页面，程序会逐字查找引文是否真的在原页面里。'],
              ['独立核查员', '另一个模型只看引文、不看网页，逐条判断：引文是完全支持、部分支持、不支持还是相反。'],
            ]}
          />
        </section>
      )}
      {showSettings && (
        <SettingsDialog
          settings={settings}
          onSave={setSettings}
          onClose={() => setShowSettings(false)}
          onExport={() => downloadJson('shenyan-backup.json', { app: 'shenyan', items })}
          onImport={(json) => {
            const d = JSON.parse(json);
            if (d.app !== 'shenyan' || !Array.isArray(d.items)) throw new Error('不是深研的备份文件');
            setItems(d.items);
          }}
        />
      )}
    </Shell>
  );
}
