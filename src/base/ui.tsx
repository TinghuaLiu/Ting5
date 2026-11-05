import { useRef, useState, type ReactNode } from 'react';
import { LANG_LABEL, MODELS, type Lang, type Settings } from './claude';
import { pdfToText } from './pdf';

// ---------------------------------------------------------------- shell

export function Shell({
  logo,
  name,
  tagline,
  needsKey,
  onHome,
  onSettings,
  storageError,
  children,
}: {
  logo: string;
  name: string;
  tagline: string;
  needsKey: boolean;
  onHome: () => void;
  onSettings: () => void;
  storageError?: string | null;
  children: ReactNode;
}) {
  return (
    <>
      <header className="topbar">
        <button className="brand" onClick={onHome}>
          <span className="logo">{logo}</span> {name} <span className="muted small">{tagline}</span>
        </button>
        <button className="btn ghost" onClick={onSettings}>
          ⚙️ 设置{needsKey && <span className="dot" />}
        </button>
      </header>
      {storageError && <div className="alert">浏览器存储空间不足，最新数据可能未保存：{storageError}。建议导出备份后删除旧记录。</div>}
      <main>{children}</main>
    </>
  );
}

// ---------------------------------------------------------------- settings

export function SettingsDialog({
  settings,
  onSave,
  onClose,
  onExport,
  onImport,
}: {
  settings: Settings;
  onSave: (s: Settings) => void;
  onClose: () => void;
  onExport?: () => void;
  onImport?: (json: string) => void;
}) {
  const [draft, setDraft] = useState(settings);
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-label="设置" onClick={(e) => e.stopPropagation()}>
        <h2>设置</h2>
        <label className="field">
          <span>Anthropic API Key</span>
          <input type="password" placeholder="sk-ant-..." value={draft.apiKey} onChange={(e) => setDraft({ ...draft, apiKey: e.target.value.trim() })} autoComplete="off" />
          <small>
            Key 只保存在这台设备的浏览器里，请求直接从浏览器发往 Anthropic，没有中间服务器。在{' '}
            <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer">
              console.anthropic.com
            </a>{' '}
            获取。没有 Key 也可以先玩内置示例。
          </small>
        </label>
        <label className="field">
          <span>模型</span>
          <select value={draft.model} onChange={(e) => setDraft({ ...draft, model: e.target.value })}>
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <div className="field">
          <span>反馈语言</span>
          <div className="seg">
            {(Object.keys(LANG_LABEL) as Lang[]).map((l) => (
              <button key={l} type="button" className={draft.lang === l ? 'on' : ''} onClick={() => setDraft({ ...draft, lang: l })}>
                {LANG_LABEL[l]}
              </button>
            ))}
          </div>
        </div>
        {(onExport || onImport) && (
          <div className="field">
            <span>数据</span>
            <div className="row">
              {onExport && (
                <button type="button" className="btn ghost" onClick={onExport}>
                  导出备份
                </button>
              )}
              {onImport && (
                <>
                  <button type="button" className="btn ghost" onClick={() => fileRef.current?.click()}>
                    导入备份
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="application/json"
                    hidden
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      try {
                        onImport(await f.text());
                        setMsg('✅ 已导入');
                      } catch (err) {
                        setMsg(`❌ ${err instanceof Error ? err.message : err}`);
                      }
                    }}
                  />
                </>
              )}
            </div>
            {msg && <small>{msg}</small>}
          </div>
        )}
        <div className="row end">
          <button type="button" className="btn ghost" onClick={onClose}>
            取消
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={() => {
              onSave(draft);
              onClose();
            }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- material input

export interface Material {
  text: string;
  name: string;
}

/** Paste text or drop a PDF / TXT / MD file. PDFs are converted to text locally with pdf.js. */
export function MaterialInput({
  placeholder,
  minChars = 80,
  busy,
  actionLabel,
  busyLabel,
  onSubmit,
  extra,
}: {
  placeholder: string;
  minChars?: number;
  busy: boolean;
  actionLabel: string;
  busyLabel: string;
  onSubmit: (m: Material) => void;
  extra?: ReactNode;
}) {
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const takeFile = async (f: File) => {
    setErr('');
    setLoading(true);
    try {
      const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
      const t = isPdf ? await pdfToText(await f.arrayBuffer()) : await f.text();
      if (isPdf && t.replace(/\[Seite\/Page \d+\]|\s/g, '').length < 50) throw new Error('这个 PDF 里读不出文字（可能是扫描件）。请先做 OCR，或直接粘贴文字。');
      setText(t);
      setName(f.name);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const submit = () => {
    const t = text.trim();
    if (t.length < minChars) return setErr(`内容太短了，至少需要 ${minChars} 个字符。`);
    onSubmit({ text: t, name: name || '粘贴的文本' });
  };

  return (
    <div>
      <label
        className={`drop ${name ? 'has' : ''}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files[0];
          if (f) takeFile(f);
        }}
      >
        <input type="file" accept=".pdf,.txt,.md,.markdown,.tex,text/plain,application/pdf" hidden onChange={(e) => e.target.files?.[0] && takeFile(e.target.files[0])} />
        {loading ? (
          <strong>
            <span className="spinner" /> 正在读取文件…
          </strong>
        ) : name ? (
          <>
            <strong>📄 {name}</strong>
            <span className="muted">已读取 {text.length.toLocaleString()} 个字符 · 点击更换</span>
          </>
        ) : (
          <>
            <strong>拖入或点击选择文件</strong>
            <span className="muted">PDF · TXT · MD · TeX（PDF 在本地转成文字，不上传原文件）</span>
          </>
        )}
      </label>
      <textarea
        className="material"
        placeholder={placeholder}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (!e.target.value) setName('');
        }}
        rows={10}
      />
      {extra}
      {err && <div className="alert">{err}</div>}
      <div className="row end">
        <button className="btn primary" disabled={busy || loading || !text.trim()} onClick={submit}>
          {busy ? (
            <>
              <span className="spinner" /> {busyLabel}
            </>
          ) : (
            actionLabel
          )}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- small pieces

export function Hero({ title, accent, children, actions }: { title: string; accent: string; children: ReactNode; actions: ReactNode }) {
  return (
    <div className="hero">
      <h1>
        {title}
        <span className="accent">{accent}</span>
      </h1>
      <div className="hero-body">{children}</div>
      <div className="row">{actions}</div>
    </div>
  );
}

export function How({ items }: { items: [string, string][] }) {
  return (
    <div className="how">
      {items.map(([t, d], i) => (
        <div key={t}>
          <span>{i + 1}</span>
          <strong>{t}</strong>
          <p>{d}</p>
        </div>
      ))}
    </div>
  );
}

export function Ring({ value, label, size = 110 }: { value: number; label?: string; size?: number }) {
  const color = value >= 85 ? 'var(--good)' : value >= 60 ? 'var(--ok)' : 'var(--bad)';
  return (
    <div className="ring" style={{ ['--p' as string]: value, ['--c' as string]: color, width: size, height: size }}>
      <span style={{ width: size * 0.8, height: size * 0.8 }}>{label ?? value}</span>
    </div>
  );
}
