import { useEffect, useRef, useState } from 'react';

/**
 * 页码/页数输入框：非法输入当场挡住（不进入输入框），并通过 onReject 提示原因。
 * - 允许清空（空串）以便重新输入，失焦时恢复为已保存值
 * - 合法输入立即通过 onCommit 提交（进度实时计算）
 */
export default function BlockingNumberInput({
  value,
  onCommit,
  onReject,
  validate,
  disabled = false,
  className = '',
  placeholder = '',
  ariaLabel,
}) {
  const [draft, setDraft] = useState(String(value ?? 0));
  const lastReject = useRef(0);

  useEffect(() => {
    setDraft(String(value ?? 0));
  }, [value]);

  const reject = (message) => {
    lastReject.current = Date.now();
    onReject?.(message);
  };

  const handleChange = (e) => {
    const raw = e.target.value;
    if (raw === '') {
      setDraft('');
      return;
    }
    const result = validate(raw);
    if (result.empty) {
      setDraft('');
      return;
    }
    if (!result.ok) {
      reject(result.message); // 挡住：不更新 draft，输入框内容保持不变
      return;
    }
    setDraft(String(result.value));
    onCommit?.(result.value);
  };

  const handleBlur = () => {
    const raw = draft.trim();
    if (raw === '') {
      setDraft(String(value ?? 0));
      return;
    }
    const result = validate(raw);
    if (!result.ok || result.empty) {
      setDraft(String(value ?? 0));
    } else {
      setDraft(String(result.value));
    }
  };

  return (
    <input
      className={`page-input ${className}`}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={draft}
      disabled={disabled}
      placeholder={placeholder}
      aria-label={ariaLabel}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
}
