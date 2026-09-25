import { useEffect, useState } from 'react';
import BlockingNumberInput from './BlockingNumberInput.jsx';
import {
  dueState,
  isPlanDone,
  progressPct,
  validatePageInput,
  validateTotalPages,
} from '../plan/plans.js';

export default function PaperDetail({
  paper,
  onUpdate,
  onPlanPatch,
  onToggleRead,
  onCopyCite,
  onFavorite,
  onRestore,
  onReject,
}) {
  const [dateDraft, setDateDraft] = useState(paper.planDate);
  const [dateMsg, setDateMsg] = useState('');
  useEffect(() => { setDateDraft(paper.planDate); setDateMsg(''); }, [paper.id, paper.planDate]);

  if (!paper) return null;

  const pct = progressPct(paper);
  const done = isPlanDone(paper);
  const due = dueState(paper);

  const commitDate = (value) => {
    onPlanPatch(paper.id, { planDate: value });
    if (value) setDateMsg('计划日期已保存');
  };

  return (
    <>
      {paper.shelved && (
        <div className="shelved-banner">
          <span>⏸ 该文献已暂时搁置，不在今日清单中，阅读进度已保留。</span>
          <button className="ghost" onClick={() => onRestore(paper.id)}>恢复到今日清单</button>
        </div>
      )}

      <div className="detail-top">
        <span className={`status ${paper.status}`}>{paper.status}</span>
        <button onClick={onFavorite}>☆ 收藏</button>
      </div>
      <h2>{paper.title}</h2>
      <p className="authors">{paper.authors}</p>
      <div className="cite-actions">
        <button onClick={onCopyCite}>▣ 复制引用</button>
        <button onClick={onToggleRead}>{paper.status === '已读' ? '标记为待读' : '标记为已读'}</button>
      </div>

      <div className="detail-section">
        <h4>阅读计划 <span>PLAN</span></h4>
        <div className="plan-grid">
          <label className="plan-date">
            计划日期
            <input
              type="date"
              value={dateDraft}
              max="2099-12-31"
              onChange={(e) => setDateDraft(e.target.value)}
              onBlur={(e) => commitDate(e.target.value)}
            />
          </label>
          <div className="plan-pages">
            <span>页码</span>
            <div className="plan-line">
              <BlockingNumberInput
                className="in-detail"
                value={paper.currentPage}
                disabled={!paper.totalPages}
                validate={(raw) => validatePageInput(raw, { totalPages: paper.totalPages, field: 'current' })}
                onCommit={(n) => onPlanPatch(paper.id, { currentPage: n })}
                onReject={onReject}
                ariaLabel="当前页"
              />
              <em>/</em>
              <BlockingNumberInput
                className="in-detail"
                value={paper.totalPages}
                validate={(raw) => validateTotalPages(raw, paper.currentPage)}
                onCommit={(n) => onPlanPatch(paper.id, { totalPages: n })}
                onReject={onReject}
                ariaLabel="总页数"
              />
              <small>页</small>
            </div>
            {!paper.totalPages && <p className="page-hint">先填写总页数，才能记录当前页</p>}
          </div>
        </div>
        <div className="plan-progress">
          <div className="progress"><i style={{ width: `${pct}%` }} /></div>
          <small>
            {done
              ? '✓ 已读满，自动标记为已读（往回修改页码可恢复阅读中）'
              : paper.totalPages
                ? `已读 ${pct}% · 第 ${paper.currentPage} / ${paper.totalPages} 页`
                : '尚未设置总页数'}
            {due === 'overdue' && !done && <b className="late-tag"> 已逾期</b>}
            {dateMsg && <span className="save-hint"> · {dateMsg}</span>}
          </small>
        </div>
      </div>

      <div className="detail-section">
        <h4>摘要 <span>ABSTRACT</span></h4>
        <p>{paper.abstract}</p>
      </div>
      <div className="detail-section">
        <h4>出版信息 <span>PUBLICATION</span></h4>
        <div className="pub-grid">
          <div><small>出版物</small><strong>{paper.venue}</strong></div>
          <div><small>年份</small><strong>{paper.year}</strong></div>
        </div>
      </div>
      <div className="detail-section">
        <h4>标签 <span>TAGS</span></h4>
        <div className="tag-row">{paper.tags.map((t) => <span key={t}>#{t}</span>)}</div>
      </div>
      <div className="detail-section">
        <h4>引用文本 <span>BIBTEX / TEXT</span></h4>
        <div className="cite-box">
          {paper.cite}
          <button onClick={onCopyCite}>复制</button>
        </div>
      </div>
      <div className="detail-section">
        <h4>我的笔记 <span>PRIVATE</span></h4>
        <textarea
          className="notes"
          placeholder="记录你的阅读想法…"
          value={paper.notes || ''}
          onChange={(e) => onUpdate(paper.id, { notes: e.target.value })}
        />
      </div>
    </>
  );
}
