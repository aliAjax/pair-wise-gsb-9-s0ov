// 存储层：localStorage 读写、旧研究库数据迁移、内置示例数据。
// 迁移时只补充/规整计划字段，原有的笔记、标签、引用、状态全部原样保留。

import { normalizePlanFields, reconcilePaper } from '../plan/plans.js';
import { shiftDateStr } from '../plan/dateUtils.js';

const STORAGE_KEY = 'research-library';

/** 内置示例（相对今天动态排期，第一次打开即可演示今日/逾期两种情况）。 */
export function seedLibrary(now = new Date()) {
  return [
    {
      id: 1,
      title: 'The Extended Mind',
      authors: 'Clark, A. & Chalmers, D.',
      year: 1998,
      venue: 'Analysis',
      tags: ['具身认知', '经典'],
      abstract:
        '本文提出心智延展论：当外部环境稳定地承担认知功能时，心智边界可以超越头脑与身体。',
      status: '阅读中',
      cite: 'Clark, A. & Chalmers, D. (1998). The Extended Mind. Analysis.',
      notes: '',
      planDate: shiftDateStr(0, now),
      currentPage: 12,
      totalPages: 30,
      shelved: false,
    },
    {
      id: 2,
      title: 'Situated Learning',
      authors: 'Lave, J. & Wenger, E.',
      year: 1991,
      venue: 'Cambridge University Press',
      tags: ['学习科学', '社会'],
      abstract: '学习发生在真实情境的参与过程中，知识与共同体实践不可分割。',
      status: '待读',
      cite: 'Lave, J. & Wenger, E. (1991). Situated Learning.',
      notes: '',
      planDate: shiftDateStr(-2, now),
      currentPage: 0,
      totalPages: 240,
      shelved: false,
    },
    {
      id: 3,
      title: 'Designing with Data',
      authors: 'Miller, S.',
      year: 2022,
      venue: 'MIT Press',
      tags: ['设计研究', '方法'],
      abstract: '一套面向设计师的数据研究方法，讨论如何把定性洞察转化为可行动的设计决策。',
      status: '已读',
      cite: 'Miller, S. (2022). Designing with Data.',
      notes: '',
      planDate: shiftDateStr(-7, now),
      currentPage: 216,
      totalPages: 216,
      shelved: false,
    },
  ];
}

/**
 * 把旧版本文献迁移到带计划字段的形态：
 * - 缺计划日期 → 默认排到今天；缺页码 → 0
 * - 其余字段（笔记 notes、标签 tags、引用 cite 等）原样保留
 */
export function migratePaper(p, now = new Date()) {
  const hasPlanInfo =
    'planDate' in p || 'totalPages' in p || 'currentPage' in p || 'shelved' in p;
  const defaults = hasPlanInfo ? {} : { planDate: shiftDateStr(0, now), totalPages: 0, currentPage: 0, shelved: false };
  const merged = { ...defaults, ...p };
  const plan = normalizePlanFields(merged, now);
  // 旧数据给了 planDate 就保留；完全没给过计划信息时补默认排期
  if (!hasPlanInfo) plan.planDate = shiftDateStr(0, now);
  return reconcilePaper({ ...merged, ...plan }, now);
}

export function loadLibrary(now = new Date()) {
  let raw;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (!raw) return seedLibrary(now);
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return seedLibrary(now);
    return data.map((p) => migratePaper(p, now));
  } catch {
    return seedLibrary(now);
  }
}

export function saveLibrary(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* 存储不可用时静默，界面仍可用 */
  }
}
