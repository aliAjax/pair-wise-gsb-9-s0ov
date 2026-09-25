import { dueState, progressPct } from '../plan/plans.js';
import { formatDateCN } from '../plan/dateUtils.js';

function planHint(p, now = new Date()) {
  if (p.shelved) return '已搁置 · 进度保留中';
  const pct = progressPct(p);
  const due = dueState(p, now);
  if (p.status === '已读' || due === 'none') {
    return due === 'none' && p.status !== '已读' ? '未排期' : `${formatDateCN(p.planDate)} · ${pct}%`;
  }
  const dateLabel = due === 'today' ? '今天' : formatDateCN(p.planDate);
  return `${dateLabel} · 第 ${p.currentPage}/${p.totalPages || '—'} 页 · ${pct}%`;
}

export default function PaperList({ papers, selectedId, onSelect }) {
  if (!papers.length) {
    return <div className="no-result">没有找到匹配的文献</div>;
  }
  return (
    <>
      {papers.map((p) => (
        <button
          className={`paper ${selectedId === p.id ? 'selected' : ''}`}
          onClick={() => onSelect(p.id)}
          key={p.id}
        >
          <div className="paper-year">{p.year}</div>
          <div className="paper-copy">
            <h3>{p.title}</h3>
            <p>{p.authors}</p>
            <div>{p.tags.map((t) => <span key={t}>#{t}</span>)}</div>
            <small className={`paper-plan ${dueState(p) === 'overdue' && p.status !== '已读' ? 'late' : ''} ${p.shelved ? 'shelved' : ''}`}>
              {planHint(p)}
            </small>
          </div>
          <small className={`status ${p.status}`}>{p.status}</small>
        </button>
      ))}
    </>
  );
}
