import { useState } from 'react';
import BlockingNumberInput from './BlockingNumberInput.jsx';
import {
  dueState,
  formatDue,
  progressPct,
  validatePageInput,
} from '../viewModels/todayItem.js';

function TodayCard({ paper, onOpen, onUpdatePage, onShelve, onReject }) {
  const pct = progressPct(paper);
  const due = dueState(paper);
  const needTotal = !paper.totalPages || paper.totalPages <= 0;
  const validateCurrent = (raw) =>
    validatePageInput(raw, { totalPages: paper.totalPages, field: 'current' });

  return (
    <div className={`today-card ${due === 'overdue' ? 'is-overdue' : ''}`}>
      <button className="today-main" onClick={() => onOpen(paper.id)}>
        <span className={`due-chip ${due}`}>{formatDue(paper)}</span>
        <h3>{paper.title}</h3>
        <p>{paper.authors}</p>
        <div className="progress-row">
          <div className="progress"><i style={{ width: `${pct}%` }} /></div>
          <small>{pct}%</small>
        </div>
      </button>
      <div className="today-inline" onClick={(e) => e.stopPropagation()}>
        <label>
          当前页
          <BlockingNumberInput
            value={paper.currentPage}
            disabled={needTotal}
            validate={validateCurrent}
            onCommit={(n) => onUpdatePage(paper.id, n)}
            onReject={onReject}
            ariaLabel={`${paper.title} 当前页`}
          />
        </label>
        <span className="page-sep">/ {needTotal ? '未设总页数' : paper.totalPages}</span>
        <button className="ghost shelve-btn" onClick={() => onShelve(paper.id)} title="暂时搁置，移出今日清单">
          ⏸ 搁置
        </button>
      </div>
      {needTotal && <p className="page-hint">还没有总页数，打开文献设置后即可记录页码</p>}
    </div>
  );
}

export default function TodayView({
  papers,
  shelvedPapers,
  onOpen,
  onUpdatePage,
  onShelve,
  onRestore,
  onReject,
  onAdd,
}) {
  const [showShelved, setShowShelved] = useState(false);
  const overdueCount = papers.filter((p) => dueState(p) === 'overdue').length;

  return (
    <>
      <header>
        <div>
          <span className="crumb">READING / TODAY</span>
          <h1>今日阅读</h1>
          <p className="head-sub">
            {papers.length
              ? `${papers.length} 篇待读 · 其中 ${overdueCount} 篇已逾期，读完自动标记为已读`
              : '今天排期的文献都读完了，明天见 ✦'}
          </p>
        </div>
        <div className="actions">
          <button className="primary" onClick={onAdd}>＋ 添加文献</button>
        </div>
      </header>

      <div className="today-body">
        {papers.length > 0 && (
          <div className="today-grid">
            {papers.map((p) => (
              <TodayCard
                key={p.id}
                paper={p}
                onOpen={onOpen}
                onUpdatePage={onUpdatePage}
                onShelve={onShelve}
                onReject={onReject}
              />
            ))}
          </div>
        )}

        {papers.length === 0 && (
          <div className="today-empty">
            <span>☕</span>
            <p>今天没有需要阅读的文献</p>
            <small>已逾期或今天到期、且未读完的文献会出现在这里</small>
          </div>
        )}

        {shelvedPapers.length > 0 && (
          <div className="shelved-box">
            <button className="shelved-toggle" onClick={() => setShowShelved((v) => !v)}>
              {showShelved ? '▾' : '▸'} 暂时搁置（{shelvedPapers.length}）
              <small>进度保留，可随时恢复</small>
            </button>
            {showShelved && (
              <ul className="shelved-list">
                {shelvedPapers.map((p) => (
                  <li key={p.id}>
                    <button className="shelved-title" onClick={() => onOpen(p.id)}>
                      {p.title}
                      <small>{progressPct(p)}% · {formatDue(p)}</small>
                    </button>
                    <button className="ghost" onClick={() => onRestore(p.id)}>恢复到清单</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </>
  );
}
