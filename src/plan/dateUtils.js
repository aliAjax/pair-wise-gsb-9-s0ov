// 日期工具：统一以本地时间的 YYYY-MM-DD 作为计划日期，避免 toISOString 的 UTC 偏移。

export const pad2 = (n) => String(n).padStart(2, '0');

export function toDateStr(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function todayStr(now = new Date()) {
  return toDateStr(now);
}

/** 相对今天偏移 offset 天的日期串，offset 可为负。 */
export function shiftDateStr(offset, now = new Date()) {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
  return toDateStr(d);
}

export function isValidDateStr(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, day] = s.split('-').map(Number);
  const d = new Date(y, m - 1, day);
  return d.getFullYear() === y && d.getMonth() === m - 1 && d.getDate() === day;
}

export function diffDays(dateStr, base = todayStr()) {
  if (!isValidDateStr(dateStr)) return null;
  const [y1, m1, d1] = dateStr.split('-').map(Number);
  const [y2, m2, d2] = base.split('-').map(Number);
  const a = new Date(y1, m1 - 1, d1).getTime();
  const b = new Date(y2, m2 - 1, d2).getTime();
  return Math.round((a - b) / 86400000);
}

export function formatDateCN(dateStr) {
  if (!isValidDateStr(dateStr)) return '未排期';
  const [, m, d] = dateStr.split('-').map(Number);
  return `${m}月${d}日`;
}
