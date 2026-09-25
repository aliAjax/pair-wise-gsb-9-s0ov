import React from 'react';
import { progressOf } from '../lib/plan.js';

export default function PaperList({ items, selected, onSelect }) {
  return (
    <section className="paper-list">
      {items.map(p => {
        const pct = Math.round(progressOf(p.plan) * 100);
        return (
          <button className={'paper ' + (selected === p.id ? 'selected' : '')} onClick={() => onSelect(p.id)} key={p.id}>
            <div className="paper-year">{p.year}</div>
            <div className="paper-copy">
              <h3>{p.title}</h3>
              <p>{p.authors}</p>
              <div>{p.tags.map(t => <span key={t}>#{t}</span>)}</div>
              {p.plan && <div className="paper-progress"><i style={{ width: pct + '%' }} /></div>}
            </div>
            <div className="paper-side">
              <small className={'status ' + p.status}>{p.status}</small>
              {p.plan?.shelved && <small className="status shelved">搁置</small>}
            </div>
          </button>
        );
      })}
      {!items.length && <div className="no-result">没有找到匹配的文献</div>}
    </section>
  );
}
