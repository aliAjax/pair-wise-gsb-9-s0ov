import { useEffect, useMemo, useRef, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import LibraryView from './components/LibraryView.jsx';
import TodayView from './components/TodayView.jsx';
import AddPaperModal from './components/AddPaperModal.jsx';
import { loadLibrary, saveLibrary } from './storage/libraryStore.js';
import {
  applyPlanUpdate,
  isPlanDone,
  selectTodayPapers,
  selectShelvedPapers,
} from './plan/plans.js';

export default function App() {
  const [items, setItems] = useState(() => loadLibrary());
  const [selectedId, setSelectedId] = useState(null);
  const [view, setView] = useState('all'); // 'all' | 'today'
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState('全部');
  const [showAdd, setShowAdd] = useState(false);
  const [notice, setNotice] = useState('');
  const toastTimer = useRef(null);

  useEffect(() => saveLibrary(items), [items]);

  const notify = (msg) => {
    setNotice(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setNotice(''), 2600);
  };

  const tags = useMemo(() => ['全部', ...new Set(items.flatMap((x) => x.tags))], [items]);
  const todayPapers = useMemo(() => selectTodayPapers(items), [items]);
  const shelvedPapers = useMemo(() => selectShelvedPapers(items), [items]);

  const filtered = useMemo(
    () =>
      items.filter(
        (x) =>
          (tag === '全部' || x.tags.includes(tag)) &&
          `${x.title}${x.authors}${x.abstract}`.toLowerCase().includes(query.toLowerCase())
      ),
    [items, tag, query]
  );

  const selected = items.find((x) => x.id === selectedId) || items[0] || null;

  const patchPaper = (id, patch) =>
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  /** 写入计划更新并给出状态联动反馈（读满自动已读 / 回退自动阅读中）。 */
  const updatePlan = (id, patch, doneMsg, fallbackMsg) => {
    const prev = items.find((x) => x.id === id);
    if (!prev) return;
    const next = applyPlanUpdate(prev, patch);
    setItems(items.map((x) => (x.id === id ? next : x)));
    const before = isPlanDone(prev);
    const after = isPlanDone(next);
    if (!before && after) notify(doneMsg);
    else if (before && !after) notify('页码已回退，状态恢复为“阅读中”');
    else if (fallbackMsg) notify(fallbackMsg);
  };

  const handleUpdatePage = (id, page) =>
    updatePlan(id, { currentPage: page }, '🎉 已读满，自动标记为已读并移出今日清单', `已更新到第 ${page} 页`);

  const handlePlanPatch = (id, patch) =>
    updatePlan(id, patch, '🎉 已读满，自动标记为已读', '阅读计划已保存');

  const handleShelve = (id) => {
    patchPaper(id, { shelved: true });
    notify('已暂时搁置，进度保留；可在下方“暂时搁置”里恢复');
  };

  const handleRestore = (id) => {
    patchPaper(id, { shelved: false });
    notify('已恢复到今日清单');
  };

  const handleToggleRead = (id) => {
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status: x.status === '已读' ? '待读' : '已读' } : x))
    );
    notify('状态已更新');
  };

  const handleCopyCite = (id) => {
    const p = items.find((x) => x.id === id);
    if (p) {
      navigator.clipboard?.writeText(p.cite);
      notify('引用文本已复制');
    }
  };

  const handleExport = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(
      new Blob([items.map((x) => x.cite).join('\n')], { type: 'text/plain' })
    );
    a.download = 'references.txt';
    a.click();
    notify('引用列表已导出');
  };

  const handleAdd = (data) => {
    const paper = { id: Date.now(), status: '待读', ...data };
    setItems((prev) => [...prev, paper]);
    setSelectedId(paper.id);
    setShowAdd(false);
    setTag('全部');
    notify('文献已加入研究库，并已排进阅读计划');
  };

  const openPaper = (id) => {
    setSelectedId(id);
    setView('all');
  };

  return (
    <div className="app">
      <Sidebar
        view={view}
        onNavigate={setView}
        totalCount={items.length}
        todayCount={todayPapers.length}
        unreadCount={items.filter((x) => x.status !== '已读').length}
        tags={tags.slice(1)}
        onTagSelect={setTag}
      />
      <main>
        <div className="mobile-tabs">
          <button className={view === 'today' ? 'active' : ''} onClick={() => setView('today')}>
            ◔ 今日阅读 {todayPapers.length > 0 && <b>{todayPapers.length}</b>}
          </button>
          <button className={view === 'all' ? 'active' : ''} onClick={() => setView('all')}>
            ▤ 所有文献
          </button>
        </div>

        {view === 'today' ? (
          <TodayView
            papers={todayPapers}
            shelvedPapers={shelvedPapers}
            onOpen={openPaper}
            onUpdatePage={handleUpdatePage}
            onShelve={handleShelve}
            onRestore={handleRestore}
            onReject={notify}
            onAdd={() => setShowAdd(true)}
          />
        ) : (
          <LibraryView
            filtered={filtered}
            selected={selected}
            tags={tags}
            query={query}
            tag={tag}
            onQuery={setQuery}
            onTag={setTag}
            onSelect={setSelectedId}
            onUpdate={patchPaper}
            onPlanPatch={handlePlanPatch}
            onToggleRead={handleToggleRead}
            onCopyCite={handleCopyCite}
            onFavorite={() => notify('已加入收藏')}
            onRestore={handleRestore}
            onReject={notify}
            onExport={handleExport}
            onAdd={() => setShowAdd(true)}
          />
        )}
      </main>

      {showAdd && <AddPaperModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
      {notice && <div className="toast">{notice}</div>}
    </div>
  );
}
