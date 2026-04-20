// F005 / F006 - Notion 风格输入框 + 核心观点输入
import { useRef } from 'react';
import { useAppStore, useDispatch } from '../../store/appStore';
import { historyManager } from '../../utils/historyManager';
import { Plus, X } from 'lucide-react';

export function CoreInsightsInput() {
  const { state, dispatch } = useAppStore();
  const { insights } = state;
  const appDispatch = useDispatch(); // 使用单独的dispatch来避免依赖state
  // Track pre-edit snapshot for undo
  const savedStateRef = useRef(state);

  const setInsights = (newInsights: string[]) => {
    historyManager.push('修改核心观点', savedStateRef.current);
    savedStateRef.current = state;
    dispatch({ type: 'SET_INSIGHTS', payload: newInsights });
  };

  const updateInsight = (idx: number, value: string) => {
    const next = [...insights];
    next[idx] = value;
    // 使用防抖更新，避免每次按键都触发重新计算
    appDispatch({ type: 'SET_INSIGHTS_NO_RECOMPUTE', payload: next });
  };

  const removeInsight = (idx: number) => {
    if (insights.length <= 3) return; // Enforce minimum 3 insights
    const next = insights.filter((_, i) => i !== idx);
    setInsights(next);
  };

  const addInsight = () => {
    if (insights.length >= 5) return;
    setInsights([...insights, '']);
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-medium text-qc-text-tertiary uppercase tracking-wider">
          核心观点
        </label>
        <span className="text-xs text-qc-text-tertiary">
          {insights.filter(i => i.trim()).length}/{insights.length}
        </span>
      </div>

      {insights.length > 5 && (
        <div className="mb-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
          建议控制在 3-5 个核心观点，当前已输入 {insights.length} 个
        </div>
      )}

      <div className="space-y-2">
        {insights.map((insight, idx) => (
          <div key={idx} className="relative group">
            <input
              type="text"
              value={insight}
              onChange={e => updateInsight(idx, e.target.value)}
              onFocus={() => { savedStateRef.current = state; }}
              onBlur={() => {
                if (insights[idx] !== savedStateRef.current.insights[idx]) {
                  historyManager.push(`修改观点 ${idx + 1}`, savedStateRef.current);
                  savedStateRef.current = state;
                }
              }}
              placeholder={`输入核心观点 ${idx + 1}...`}
              className="notion-input w-full"
            />
            {insight && insights.length > 3 && (
              <button
                onClick={() => removeInsight(idx)}
                className="remove-btn absolute right-2 top-1/2 -translate-y-1/2"
                title="清除"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      {insights.length < 5 && (
        <button
          onClick={addInsight}
          className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-qc-text-tertiary
                     hover:text-qc-accent hover:bg-qc-accent-light rounded-lg border border-dashed border-qc-border-light
                     hover:border-qc-accent transition-all"
        >
          <Plus size={12} />
          添加观点
        </button>
      )}
    </section>
  );
}
