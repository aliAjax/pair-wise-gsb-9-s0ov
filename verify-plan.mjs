// 临时验证脚本：计划计算 + 旧数据迁移（运行后可删除）
import { migratePaper, loadLibrary, seedLibrary } from './src/storage/libraryStore.js';
import {
  applyPlanUpdate,
  isPlanDone,
  progressPct,
  selectTodayPapers,
  validatePageInput,
  validateTotalPages,
} from './src/plan/plans.js';
import { shiftDateStr, todayStr } from './src/plan/dateUtils.js';

let pass = 0, fail = 0;
const ok = (cond, name) => { cond ? pass++ : fail++; console.log((cond ? '✓' : '✗ FAIL'), name); };

// 1. 旧数据迁移：无计划字段 → 默认排期今天、页数 0，原有字段保留
const legacy = { id: 9, title: 'Old Paper', authors: 'A', year: 2000, venue: 'V', tags: ['t1'], abstract: 'abs', status: '阅读中', cite: 'A (2000).', notes: '我的旧笔记' };
const m = migratePaper(legacy);
ok(m.planDate === todayStr(), '旧数据默认计划日期=今天');
ok(m.totalPages === 0 && m.currentPage === 0 && m.shelved === false, '旧数据默认页数/搁置');
ok(m.notes === '我的旧笔记' && m.tags[0] === 't1' && m.cite === 'A (2000).' && m.status === '阅读中', '笔记/标签/引用/状态保留');

// 2. 旧数据已读满 → 自动已读
const full = migratePaper({ ...legacy, id: 10, status: '阅读中', planDate: todayStr(), totalPages: 100, currentPage: 100 });
ok(full.status === '已读', '迁移时读满自动已读');

// 3. 进度计算
ok(progressPct({ totalPages: 200, currentPage: 50 }) === 25, '进度 25%');
ok(progressPct({ totalPages: 0, currentPage: 0 }) === 0, '未设总页数进度 0');

// 4. 页码校验：超总页数挡住并提示上限
const over = validatePageInput('31', { totalPages: 30, field: 'current' });
ok(!over.ok && over.message.includes('30'), '超总页数被挡且提示可填上限');
ok(validatePageInput('30', { totalPages: 30, field: 'current' }).ok, '等于总页数允许');
ok(!validatePageInput('abc', { totalPages: 30, field: 'current' }).ok, '非数字被挡');
ok(!validateTotalPages('10', 20).ok, '总页数小于当前页被挡');

// 5. 状态联动：读满自动已读，回退恢复阅读中
let p = { ...m, totalPages: 30, currentPage: 29, status: '阅读中' };
p = applyPlanUpdate(p, { currentPage: 30 });
ok(p.status === '已读' && isPlanDone(p), '读满自动已读');
p = applyPlanUpdate(p, { currentPage: 10 });
ok(p.status === '阅读中', '回退页码恢复阅读中');

// 6. 今日清单：逾期+今天、未读完、未搁置；未来/已读/搁置不进
const items = [
  { id: 1, status: '阅读中', planDate: shiftDateStr(-3), currentPage: 5, totalPages: 30, shelved: false },  // 逾期
  { id: 2, status: '待读', planDate: todayStr(), currentPage: 0, totalPages: 30, shelved: false },          // 今天
  { id: 3, status: '待读', planDate: shiftDateStr(2), currentPage: 0, totalPages: 30, shelved: false },      // 未来
  { id: 4, status: '已读', planDate: shiftDateStr(-1), currentPage: 30, totalPages: 30, shelved: false },    // 已读
  { id: 5, status: '阅读中', planDate: todayStr(), currentPage: 3, totalPages: 30, shelved: true },          // 搁置
];
const today = selectTodayPapers(items).map((x) => x.id);
ok(today.length === 2 && today[0] === 1 && today[1] === 2, '今日清单=逾期在前+今天，排除未来/已读/搁置');

// 7. 搁置后进度保留
const shelved = applyPlanUpdate(items[0], { shelved: true });
ok(shelved.currentPage === 5 && shelved.shelved === true, '搁置保留进度');

// 8. 种子数据：一篇今天、一篇逾期、一篇已读
const seed = seedLibrary();
ok(seed.length === 3 && seed[0].planDate === todayStr() && seed[1].planDate < todayStr(), '种子排期正确');
ok(typeof loadLibrary === 'function', 'loadLibrary 可用（无 localStorage 环境回退种子）');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
