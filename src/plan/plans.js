// 阅读计划的计算层：进度、已读状态、今日清单分组、页码输入校验。
// 该模块不碰 localStorage 也不碰 React，纯函数，便于后续单独扩展。

import { diffDays, isValidDateStr, todayStr } from './dateUtils.js';

/**
 * 规整一篇文献上的计划字段。
 * - planDate：合法的 YYYY-MM-DD，或 '' 表示暂未排期
 * - totalPages / currentPage：非负整数
 * - shelved：是否暂时搁置（移出今日清单，进度保留）
 */
export function normalizePlanFields(p, now = new Date()) {
  const planDate = isValidDateStr(p.planDate) ? p.planDate : '';
  let totalPages = Number.isFinite(Number(p.totalPages)) ? Math.floor(Number(p.totalPages)) : 0;
  if (totalPages < 0) totalPages = 0;
  let currentPage = Number.isFinite(Number(p.currentPage)) ? Math.floor(Number(p.currentPage)) : 0;
  if (currentPage < 0) currentPage = 0;
  if (totalPages > 0 && currentPage > totalPages) currentPage = totalPages;
  if (totalPages === 0) currentPage = 0;
  return {
    planDate,
    totalPages,
    currentPage,
    shelved: p.shelved === true,
  };
}

export function isPlanDone(p) {
  return p.totalPages > 0 && p.currentPage >= p.totalPages;
}

/** 进度百分比 0-100；未设总页数时为 0。 */
export function progressPct(p) {
  if (!p.totalPages || p.totalPages <= 0) return 0;
  return Math.round((p.currentPage / p.totalPages) * 100);
}

/**
 * 旧数据/异常数据打开时做一次状态对账：
 * 读满的文献自动标成“已读”；其余沿用原有状态（笔记、标签、引用等不动）。
 */
export function reconcilePaper(p, now = new Date()) {
  const plan = normalizePlanFields(p, now);
  let status = p.status;
  if (isPlanDone(plan)) status = '已读';
  return { ...p, ...plan, status };
}

/**
 * 写入一次计划更新并联动状态：
 * - 到达总页数自动“已读”
 * - 原本已读满、又把页码改回总页数以下（或调大总页数）→ 自动回到“阅读中”
 *   （仅针对“曾读满”的文献；手动标记已读但未记满页的不受影响）
 */
export function applyPlanUpdate(p, patch, now = new Date()) {
  const wasDone = isPlanDone(normalizePlanFields(p, now));
  const next = reconcilePaper({ ...p, ...patch }, now);
  if (wasDone && !isPlanDone(next) && next.status === '已读') {
    next.status = '阅读中';
  }
  return next;
}

export function isUnread(p) {
  return p.status !== '已读' && !isPlanDone(p);
}

/** 'overdue' | 'today' | 'future' | 'none' */
export function dueState(p, now = new Date()) {
  if (!isValidDateStr(p.planDate)) return 'none';
  const delta = diffDays(p.planDate, todayStr(now));
  if (delta < 0) return 'overdue';
  if (delta === 0) return 'today';
  return 'future';
}

/** 今日阅读：已逾期或今天到期、未读完、未搁置。逾期在前，同组日期升序。 */
export function selectTodayPapers(items, now = new Date()) {
  return items
    .filter((p) => !p.shelved && isUnread(p) && ['overdue', 'today'].includes(dueState(p, now)))
    .sort((a, b) => (a.planDate < b.planDate ? -1 : a.planDate > b.planDate ? 1 : 0));
}

export function selectShelvedPapers(items) {
  return items.filter((p) => p.shelved);
}

/**
 * 校验页码输入。返回 { ok, value, message }。
 * 空串表示用户正在清空输入框，交给 UI 自行处理。
 */
export function validatePageInput(raw, { totalPages, field }) {
  if (raw === '' || raw === null || raw === undefined) return { ok: false, empty: true };
  if (!/^\d+$/.test(String(raw).trim())) {
    return { ok: false, message: '页码只能是 0 或正整数' };
  }
  const n = parseInt(String(raw).trim(), 10);
  if (field === 'current') {
    if (n < 0) return { ok: false, message: '页码不能小于 0' };
    if (totalPages > 0 && n > totalPages) {
      return { ok: false, message: `超出总页数：本书最多只能填到第 ${totalPages} 页` };
    }
  } else if (field === 'total') {
    if (n < 0) return { ok: false, message: '总页数不能小于 0' };
  }
  return { ok: true, value: n };
}

/** 设置总页数时不能小于当前页（0 表示尚未设置总页数，允许）。 */
export function validateTotalPages(rawTotal, currentPage) {
  const r = validatePageInput(rawTotal, { field: 'total' });
  if (!r.ok) return r;
  if (r.value > 0 && r.value < currentPage) {
    return { ok: false, message: `总页数不能小于当前第 ${currentPage} 页` };
  }
  return r;
}
