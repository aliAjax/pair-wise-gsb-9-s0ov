import React from 'react';

export default function Sidebar({ view, onView, items, tags, onTag, dueCount }) {
  return (
    <aside>
      <div className="logo"><span>∴</span> LITERATURE</div>
      <div className="library-head">
        <span>我的研究库</span>
        <strong>{items.length}<small> 篇文献</small></strong>
      </div>
      <nav>
        <button className={view === 'all' ? 'active' : ''} onClick={() => onView('all')}>▤ <span>所有文献</span><b>{items.length}</b></button>
        <button className={view === 'today' ? 'active' : ''} onClick={() => onView('today')}>☀ <span>今日阅读</span><b>{dueCount}</b></button>
        <button>▥ <span>待读</span><b>{items.filter(x => x.status === '待读').length}</b></button>
        <button>✓ <span>已读</span><b>{items.filter(x => x.status === '已读').length}</b></button>
        <button>☆ <span>收藏</span></button>
      </nav>
      <div className="side-tags">
        <small>标签</small>
        {tags.slice(1, 5).map(t => <button onClick={() => onTag(t)} key={t}># {t}</button>)}
      </div>
      <div className="side-foot">
        <button>⚙ 偏好设置</button>
        <small>本地数据库 · 已同步</small>
      </div>
    </aside>
  );
}
