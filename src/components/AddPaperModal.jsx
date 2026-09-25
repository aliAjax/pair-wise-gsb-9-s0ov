import { useState } from 'react';
import { todayStr } from '../plan/dateUtils.js';

const blank = () => ({
  title: '',
  authors: '',
  year: String(new Date().getFullYear()),
  venue: '',
  abstract: '',
  tags: '',
  planDate: todayStr(),
  totalPages: '',
});

export default function AddPaperModal({ onClose, onAdd }) {
  const [form, setForm] = useState(blank);
  const [error, setError] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.title.trim()) {
      setError('请先填写标题');
      return;
    }
    const total = form.totalPages === '' ? 0 : Number(form.totalPages);
    if (!Number.isFinite(total) || total < 0 || Math.floor(total) !== total) {
      setError('总页数需为非负整数，或留空稍后再填');
      return;
    }
    onAdd({
      title: form.title.trim(),
      authors: form.authors.trim(),
      year: Number(form.year) || new Date().getFullYear(),
      venue: form.venue.trim(),
      abstract: form.abstract.trim(),
      tags: form.tags.split(',').map((x) => x.trim()).filter(Boolean),
      cite: `${form.authors.trim()} (${form.year}). ${form.title.trim()}. ${form.venue.trim()}.`,
      notes: '',
      planDate: form.planDate || todayStr(),
      currentPage: 0,
      totalPages: total,
      shelved: false,
    });
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose}>×</button>
        <span className="crumb">NEW REFERENCE</span>
        <h2>添加一篇文献</h2>
        <label>标题
          <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="论文或书籍标题" />
        </label>
        <label>作者
          <input value={form.authors} onChange={(e) => set('authors', e.target.value)} />
        </label>
        <div className="two">
          <label>年份
            <input type="number" value={form.year} onChange={(e) => set('year', e.target.value)} />
          </label>
          <label>出版物
            <input value={form.venue} onChange={(e) => set('venue', e.target.value)} />
          </label>
        </div>
        <div className="two">
          <label>计划读完日期
            <input type="date" value={form.planDate} onChange={(e) => set('planDate', e.target.value)} />
          </label>
          <label>总页数（可稍后填）
            <input type="text" inputMode="numeric" value={form.totalPages} placeholder="如 240"
              onChange={(e) => set('totalPages', e.target.value)} />
          </label>
        </div>
        <label>关键词
          <input value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="用逗号分隔" />
        </label>
        <label>摘要
          <textarea rows="3" value={form.abstract} onChange={(e) => set('abstract', e.target.value)} />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="primary full" onClick={submit}>保存文献</button>
      </div>
    </div>
  );
}
