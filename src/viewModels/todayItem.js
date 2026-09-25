// 今日清单的视图模型：把计划计算层的结果翻译成界面文案。
// 计算逻辑仍在 plan/plans.js，这里只做展示组装。

import { dueState as computeDueState, progressPct, validatePageInput } from '../plan/plans.js';
import { diffDays, formatDateCN, todayStr } from '../plan/dateUtils.js';

export { progressPct, validatePageInput };

export function dueState(p, now = new Date()) {
  return computeDueState(p, now);
}

/** “今天” / “已逾期 N 天 · 9月18日” / “9月30日” / “未排期” */
export function formatDue(p, now = new Date()) {
  const state = computeDueState(p, now);
  if (state === 'none') return '未排期';
  const delta = diffDays(p.planDate, todayStr(now));
  if (state === 'today') return `今天 · ${formatDateCN(p.planDate)}`;
  if (state === 'overdue') {
    const days = Math.abs(delta);
    return days === 1
      ? `昨天逾期 · ${formatDateCN(p.planDate)}`
      : `已逾期 ${days} 天 · ${formatDateCN(p.planDate)}`;
  }
  return formatDateCN(p.planDate);
}
