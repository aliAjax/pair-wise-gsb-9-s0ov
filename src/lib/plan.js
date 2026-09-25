// 阅读计划的纯计算逻辑：不碰界面，也不碰存储
export const DEFAULT_TOTAL = 30;

export const todayStr = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// 新文献 / 旧数据迁移共用的默认计划：已读的按读满处理，其余从第 0 页、今天开始
export const defaultPlan = (status = '待读') => ({
  date: todayStr(),
  page: status === '已读' ? DEFAULT_TOTAL : 0,
  total: DEFAULT_TOTAL,
  shelved: false,
});

// 旧研究库数据第一次打开时补上默认计划，已有的计划字段原样保留
export const withPlan = (item) => ({
  ...item,
  plan: { ...defaultPlan(item.status), ...(item.plan || {}) },
});

// 进度只由页码推导，实时计算
export const progressOf = (plan) =>
  plan && plan.total > 0 ? Math.min(plan.page, plan.total) / plan.total : 0;

export const isFinished = (plan) => !!plan && plan.total > 0 && plan.page >= plan.total;

// 今日清单：计划日期在今天或更早（逾期）、未搁置、还没读完
export const isDue = (item, today = todayStr()) =>
  !!item.plan &&
  !item.plan.shelved &&
  item.status !== '已读' &&
  !isFinished(item.plan) &&
  item.plan.date <= today;

export const overdueDays = (plan, today = todayStr()) => {
  if (!plan || plan.date >= today) return 0;
  return Math.round((new Date(today) - new Date(plan.date)) / 86400000);
};

// 页码校验：越界输入被挡住，并告知最多能填到哪里
export const clampPage = (plan, raw) => {
  const value = Number(raw);
  if (raw === '' || Number.isNaN(value) || value < 0)
    return { ok: false, value: plan.page, message: '页码不能小于 0' };
  if (value > plan.total)
    return { ok: false, value: plan.page, message: `超过总页数了，最多只能填到第 ${plan.total} 页` };
  return { ok: true, value: Math.floor(value) };
};

export const clampTotal = (raw) => {
  const value = Number(raw);
  if (raw === '' || Number.isNaN(value) || value < 1)
    return { ok: false, message: '总页数至少为 1' };
  return { ok: true, value: Math.floor(value) };
};
