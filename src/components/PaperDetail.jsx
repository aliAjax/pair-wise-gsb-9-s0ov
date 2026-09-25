import React, { useState } from 'react';
import { progressOf, todayStr } from '../lib/plan.js';

export default function PaperDetail({ cur, onUpdate, onPage, onTotal, onToggleShelve, onCopy, onFav }) {
  const [hint, setHint] = useState('');
  if (!cur) return <section className="detail" />;

  const pct = Math.round(progressOf(cur.plan) * 100);
  const page = (e) => { const r = onPage(cur.id, e.target.value); setHint(r.ok ? '' : r.message); };
  const total = (e) => { const r = onTotal(cur.id, e.target.value); setHint(r.ok ? '' : r.message); };

  return (
    <section className="detail">
      <div className="detail-top">
        <span className="status reading">{cur.status}</span>
        <button onClick={onFav}>☆ 收藏</button>
      </div>
      <h2>{cur.title}</h2>
      <p className="authors">{cur.authors}</p>
      <div className="cite-actions">
        <button onClick={onCopy}>▣ 复制引用</button>
        <button onClick={() => onUpdate('status', cur.status === '已读' ? '待读' : '已读')}>
          {cur.status === '已读' ? '标记为待读' : '标记为已读'}
        </button>
      </div>

      <div className="detail-section">
        <h4>阅读计划 <span>READING PLAN</span></h4>
        <div className="plan-grid">
          <label>计划日期
            <input type="date" value={cur.plan.date}
              onChange={e => onUpdate('plan', { ...cur.plan, date: e.target.value || todayStr() })} />
          </label>
          <label>当前页码
            <input type="number" min="0" max={cur.plan.total} value={cur.plan.page} onChange={page} />
          </label>
          <label>总页数
            <input type="number" min="1" value={cur.plan.total} onChange={total} />
          </label>
        </div>
        {hint && <p className="plan-hint">{hint}</p>}
        <div className="progress"><i style={{ width: pct + '%' }} /></div>
        <div className="plan-meta">
          <span>{cur.plan.page} / {cur.plan.total} 页 · {pct}%{cur.plan.shelved ? ' · 已搁置' : ''}</span>
          <button onClick={() => onToggleShelve(cur.id)}>
            {cur.plan.shelved ? '↩ 恢复阅读' : '⏸ 暂时搁置'}
          </button>
        </div>
      </div>

      <div className="detail-section">
        <h4>摘要 <span>ABSTRACT</span></h4>
        <p>{cur.abstract}</p>
      </div>
      <div className="detail-section">
        <h4>出版信息 <span>PUBLICATION</span></h4>
        <div className="pub-grid">
          <div><small>出版物</small><strong>{cur.venue}</strong></div>
          <div><small>年份</small><strong>{cur.year}</strong></div>
        </div>
      </div>
      <div className="detail-section">
        <h4>引用文本 <span>BIBTEX / TEXT</span></h4>
        <div className="cite-box">{cur.cite}<button onClick={onCopy}>复制</button></div>
      </div>
      <div className="detail-section">
        <h4>我的笔记 <span>PRIVATE</span></h4>
        <textarea className="notes" placeholder="记录你的阅读想法…" value={cur.notes || ''}
          onChange={e => onUpdate('notes', e.target.value)} />
      </div>
    </section>
  );
}
