import PaperList from './PaperList.jsx';
import PaperDetail from './PaperDetail.jsx';

export default function LibraryView({
  filtered,
  selected,
  tags,
  query,
  tag,
  onQuery,
  onTag,
  onSelect,
  onUpdate,
  onPlanPatch,
  onToggleRead,
  onCopyCite,
  onFavorite,
  onRestore,
  onReject,
  onExport,
  onAdd,
}) {
  return (
    <>
      <header>
        <div>
          <span className="crumb">RESEARCH / LIBRARY</span>
          <h1>所有文献</h1>
        </div>
        <div className="actions">
          <button className="outline" onClick={onExport}>↓ 导出引用</button>
          <button className="primary" onClick={onAdd}>＋ 添加文献</button>
        </div>
      </header>
      <div className="toolbar">
        <div className="search">
          ⌕
          <input
            placeholder="搜索标题、作者或摘要…"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
          />
          {query && <button onClick={() => onQuery('')}>×</button>}
        </div>
        <div className="tag-filter">
          {tags.map((t) => (
            <button className={tag === t ? 'on' : ''} onClick={() => onTag(t)} key={t}>{t}</button>
          ))}
        </div>
      </div>
      <div className="body">
        <section className="paper-list">
          <PaperList papers={filtered} selectedId={selected?.id} onSelect={onSelect} />
        </section>
        <section className="detail">
          {selected && (
            <PaperDetail
              paper={selected}
              onUpdate={onUpdate}
              onPlanPatch={onPlanPatch}
              onToggleRead={() => onToggleRead(selected.id)}
              onCopyCite={() => onCopyCite(selected.id)}
              onFavorite={onFavorite}
              onRestore={onRestore}
              onReject={onReject}
            />
          )}
        </section>
      </div>
    </>
  );
}
