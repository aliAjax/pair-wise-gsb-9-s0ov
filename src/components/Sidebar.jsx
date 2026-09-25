
export default function Sidebar({
  view,
  onNavigate,
  totalCount,
  todayCount,
  unreadCount,
  tags,
  onTagSelect,
}) {
  return (
    <aside>
      <div className="logo"><span>∴</span> LITERATURE</div>
      <div className="library-head">
        <span>我的研究库</span>
        <strong>{totalCount}<small> 篇文献</small></strong>
      </div>
      <nav>
        <button className={view === 'today' ? 'active' : ''} onClick={() => onNavigate('today')}>
          ◔ <span>今日阅读</span>
          {todayCount > 0 && <b className="nav-badge">{todayCount}</b>}
        </button>
        <button className={view === 'all' ? 'active' : ''} onClick={() => onNavigate('all')}>
          ▤ <span>所有文献</span><b>{totalCount}</b>
        </button>
        <button>▥ <span>待读</span><b>{unreadCount}</b></button>
        <button>✓ <span>已读</span></button>
        <button>☆ <span>收藏</span></button>
      </nav>
      <div className="side-tags">
        <small>标签</small>
        {tags.slice(0, 5).map((t) => (
          <button key={t} onClick={() => { onTagSelect(t); onNavigate('all'); }}>
            # {t}
          </button>
        ))}
      </div>
      <div className="side-foot">
        <button>⚙ 偏好设置</button>
        <small>本地数据库 · 已同步</small>
      </div>
    </aside>
  );
}
