// F063 - 字体大小选择器
import { useAppStore } from '../../store/appStore';

export function FontSizeSelector() {
  const { state, dispatch } = useAppStore();
  const { fontSize } = state;

  const sizeOptions = [
    { value: 'small', label: '小号字体', description: '适合密集内容' },
    { value: 'normal', label: '标准字体', description: '默认大小' },
    { value: 'large', label: '大号字体', description: '易于阅读' },
  ];

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-medium text-qc-text-tertiary uppercase tracking-wider">
          字体大小
        </label>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {sizeOptions.map(option => (
          <button
            key={option.value}
            onClick={() => dispatch({ type: 'SET_FONT_SIZE', payload: option.value as 'small' | 'normal' | 'large' })}
            className={`px-3 py-2 rounded-lg border text-center transition-all ${
              fontSize === option.value
                ? 'border-qc-accent bg-qc-accent-light text-qc-accent'
                : 'border-qc-border-light hover:border-qc-border-medium text-qc-text-secondary'
            }`}
          >
            <div className="text-[11px] font-semibold leading-tight">{option.label}</div>
            <div className="text-[9px] opacity-60 mt-0.5 leading-tight">{option.description}</div>
          </button>
        ))}
      </div>
    </section>
  );
}