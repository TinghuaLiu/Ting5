import { Fragment } from 'react';

/** Renders **bold** inline (models occasionally use it) instead of showing raw asterisks. */
export function Inline({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/gs);
  return (
    <>
      {parts.map((p, i) => (i % 2 === 1 ? <strong key={i}>{p}</strong> : <Fragment key={i}>{p}</Fragment>))}
    </>
  );
}
