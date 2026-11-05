import { useEffect, useState } from 'react';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const v = JSON.parse(raw);
    // merge new default fields into stored settings-like objects
    if (fallback && typeof fallback === 'object' && !Array.isArray(fallback) && v && typeof v === 'object' && !Array.isArray(v)) return { ...fallback, ...v };
    return Array.isArray(fallback) === Array.isArray(v) ? (v as T) : fallback;
  } catch {
    return fallback;
  }
}

/** State persisted to localStorage. Returns [value, setValue, saveError]. */
export function usePersisted<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => load(key, fallback));
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [key, value]);
  return [value, setValue, error] as const;
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export function downloadJson(name: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}
