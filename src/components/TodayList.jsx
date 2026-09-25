import React, { useState } from 'react';
import { progressOf, overdueDays } from '../lib/plan.js';

// 今日阅读清单：就地更新页码，越界输入被挡住并在行内提示
export default function TodayList({ items, selected, onSelect, onPage, onShelve }) {
  const [hints, setHints] = useState({});
  const change = (id, raw) => {
    const r = onPage(id, raw);
    setHints(h => ({ ...h, [id]: r.ok ? null : r.message }));
  };

  if (!items.length) {
    return (
      <section className="today-list">
        <div className="no-result">
          今天的阅读清单是空的
          <small>在文献详情里把计划日期设成今天或更早，就会出现在这里</small>
        </div>
      </section>
    );
  }

  const overdue = items.filter(p => overdueDays(p.plan) > 0).length;
  return (
    <section className="today-list">
      <p className="today-summary">{items.length} 篇待读{overdue ? ` · ${overdue} 篇已逾期` : ''}</p>
      {items.map(p => {
        const pct = Math.round(progressOf(p.plan) * 100);
        const days = overdueDays(p.plan);
        return (
          <div className={'today-row ' + (selected === p.id ? 'selected' : '')} key={p.id}>
            <button className="today-main" onClick={() => onSelect(p.id)}>
              <h3>{p.title}</h3>
              <p>{p.authors}</p>
              {days > 0
                ? <span className="overdue">逾期 {days} 天 · 原计划 {p.plan.date}</span>
                : <span className="due-today">今天到期</span>}
            </button>
            <div className="today-page">
              <div className="stepper">
                <button onClick={() => change(p.id, p.plan.page - 1)}>−</button>
                <input type="number" min="0" max={p.plan.total} value={p.plan.page}
                  onChange={e => change(p.id, e.target.value)} />
                <button onClick={() => change(p.id, p.plan.page + 1)}>＋</button>
              </div>
              <div className="progress"><i style={{ width: pct + '%' }} /></div>
              <small>{p.plan.page} / {p.plan.total} 页 · {pct}%</small>
              {hints[p.id] && <em className="plan-hint">{hints[p.id]}</em>}
              <button className="shelve" onClick={() => onShelve(p.id)}>暂时搁置</button>
            </div>
          </div>
        );
      })}
    </section>
  );
}
