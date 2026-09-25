import React, { useEffect, useMemo, useState } from 'react';
import { loadLibrary, saveLibrary } from './lib/store.js';
import { defaultPlan, isDue, isFinished, clampPage, clampTotal } from './lib/plan.js';
import Sidebar from './components/Sidebar.jsx';
import PaperList from './components/PaperList.jsx';
import PaperDetail from './components/PaperDetail.jsx';
import TodayList from './components/TodayList.jsx';
import AddModal from './components/AddModal.jsx';

export default function App() {
  const [items, setItems] = useState(loadLibrary);
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState('all');
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState('全部');
  const [show, setShow] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => saveLibrary(items), [items]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 2600);
    return () => clearTimeout(t);
  }, [notice]);

  const tags = ['全部', ...new Set(items.flatMap(x => x.tags))];
  const filtered = useMemo(
    () => items.filter(x =>
      (tag === '全部' || x.tags.includes(tag)) &&
      `${x.title}${x.authors}${x.abstract}`.toLowerCase().includes(query.toLowerCase())),
    [items, tag, query]);
  // 今日清单：今天到期 + 已逾期且未读完，按原计划日期升序（最急的在前）
  const dueItems = useMemo(
    () => items.filter(x => isDue(x)).sort((a, b) => a.plan.date.localeCompare(b.plan.date)),
    [items]);
  const cur = items.find(x => x.id === selected) || items[0];

  const patchItem = (id, patch) => setItems(items.map(x => (x.id === id ? { ...x, ...patch } : x)));

  // 计划变更只动 plan 与 status：读满自动标已读，从读满退回则回到阅读中；
  // 笔记、标签、引用等其余字段原样保留
  const patchPlan = (id, patch) => setItems(items.map(x => {
    if (x.id !== id) return x;
    const plan = { ...x.plan, ...patch };
    const was = isFinished(x.plan);
    const now = isFinished(plan);
    let status = x.status;
    if (!was && now) status = '已读';
    else if (was && !now && status === '已读') status = '阅读中';
    return { ...x, plan, status };
  }));

  const changePage = (id, raw) => {
    const it = items.find(x => x.id === id);
    const r = clampPage(it.plan, raw);
    if (r.ok) {
      const finished = isFinished({ ...it.plan, page: r.value });
      patchPlan(id, { page: r.value });
      if (finished && !isFinished(it.plan)) setNotice('本篇已读完，自动标记为已读');
    }
    return r;
  };

  const changeTotal = (id, raw) => {
    const it = items.find(x => x.id === id);
    const r = clampTotal(raw);
    if (r.ok) patchPlan(id, { total: r.value, page: Math.min(it.plan.page, r.value) });
    return r;
  };

  // 搁置只影响今日清单的展示，页码进度原样保留
  const toggleShelve = (id) => {
    const it = items.find(x => x.id === id);
    const shelved = !it.plan.shelved;
    patchPlan(id, { shelved });
    setNotice(shelved ? '已暂时搁置，阅读进度保留' : '已恢复阅读计划');
  };

  const add = (form) => {
    const p = {
      ...form,
      id: Date.now(),
      year: +form.year,
      tags: form.tags.split(',').map(x => x.trim()).filter(Boolean),
      status: '待读',
      cite: `${form.authors} (${form.year}). ${form.title}. ${form.venue}.`,
      plan: defaultPlan('待读'),
    };
    setItems([...items, p]);
    setSelected(p.id);
    setShow(false);
    setNotice('文献已加入研究库');
  };

  const copyCite = () => {
    navigator.clipboard?.writeText(cur.cite);
    setNotice('引用文本已复制');
  };

  const download = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([items.map(x => x.cite).join('\n')], { type: 'text/plain' }));
    a.download = 'references.txt';
    a.click();
    setNotice('引用列表已导出');
  };

  return (
    <div className="app">
      <Sidebar view={view} onView={setView} items={items} tags={tags} onTag={t => { setTag(t); setView('all'); }} dueCount={dueItems.length} />
      <main>
        <header>
          <div>
            <span className="crumb">RESEARCH / {view === 'today' ? 'TODAY' : 'LIBRARY'}</span>
            <h1>{view === 'today' ? '今日阅读' : '所有文献'}</h1>
          </div>
          <div className="actions">
            <button className="outline" onClick={download}>↓ 导出引用</button>
            <button className="primary" onClick={() => setShow(true)}>＋ 添加文献</button>
          </div>
        </header>
        {view === 'all' && (
          <div className="toolbar">
            <div className="search">
              ⌕<input placeholder="搜索标题、作者或摘要…" value={query} onChange={e => setQuery(e.target.value)} />
              {query && <button onClick={() => setQuery('')}>×</button>}
            </div>
            <div className="tag-filter">
              {tags.map(t => <button className={tag === t ? 'on' : ''} onClick={() => setTag(t)} key={t}>{t}</button>)}
            </div>
          </div>
        )}
        <div className="body">
          {view === 'today'
            ? <TodayList items={dueItems} selected={selected} onSelect={setSelected} onPage={changePage} onShelve={toggleShelve} />
            : <PaperList items={filtered} selected={cur?.id} onSelect={setSelected} />}
          <PaperDetail
            cur={cur}
            onUpdate={(k, v) => patchItem(cur.id, { [k]: v })}
            onPage={changePage}
            onTotal={changeTotal}
            onToggleShelve={toggleShelve}
            onCopy={copyCite}
            onFav={() => setNotice('已加入收藏')}
          />
        </div>
      </main>
      {show && <AddModal onAdd={add} onClose={() => setShow(false)} />}
      {notice && <div className="toast">{notice}</div>}
    </div>
  );
}
