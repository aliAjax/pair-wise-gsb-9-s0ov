import React, { useState } from 'react';

const empty = () => ({ title: '', authors: '', year: String(new Date().getFullYear()), venue: '', abstract: '', tags: '' });

export default function AddModal({ onAdd, onClose }) {
  const [form, setForm] = useState(empty);
  const save = () => {
    if (!form.title) return;
    onAdd(form);
  };
  return (
    <div className="modal-bg">
      <div className="modal">
        <button className="close" onClick={onClose}>×</button>
        <span className="crumb">NEW REFERENCE</span>
        <h2>添加一篇文献</h2>
        <label>标题<input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="论文或书籍标题" /></label>
        <label>作者<input value={form.authors} onChange={e => setForm({ ...form, authors: e.target.value })} /></label>
        <div className="two">
          <label>年份<input type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} /></label>
          <label>出版物<input value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} /></label>
        </div>
        <label>关键词<input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="用逗号分隔" /></label>
        <label>摘要<textarea rows="3" value={form.abstract} onChange={e => setForm({ ...form, abstract: e.target.value })} /></label>
        <button className="primary full" onClick={save}>保存文献</button>
      </div>
    </div>
  );
}
