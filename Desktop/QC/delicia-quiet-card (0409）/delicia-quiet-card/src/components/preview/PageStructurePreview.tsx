// F020 - 分页可视化预览 + F021 卡片类型切换
import { useAppStore } from '../../store/appStore';
import { CardType } from '../../types';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const CARD_TYPE_OPTIONS = [
  { value: CardType.COVER, label: '封面', color: '#7C8C3E' },
  { value: CardType.GUIDE, label: '导读', color: '#5D7A9B' },
  { value: CardType.BODY, label: '正文', color: '#787774' },
  { value: CardType.SUMMARY, label: '总结', color: '#9B7A5D' },
  { value: CardType.CTA, label: 'CTA', color: '#A63A3A' },
];

const TYPE_LABELS: Record<CardType, string> = {
  [CardType.COVER]: '封面',
  [CardType.GUIDE]: '导读',
  [CardType.BODY]: '正文',
  [CardType.SUMMARY]: '总结',
  [CardType.CTA]: 'CTA',
};

const TYPE_COLORS: Record<CardType, string> = {
  [CardType.COVER]: '#7C8C3E',
  [CardType.GUIDE]: '#5D7A9B',
  [CardType.BODY]: '#787774',
  [CardType.SUMMARY]: '#9B7A5D',
  [CardType.CTA]: '#A63A3A',
};

export function PageStructurePreview() {
  const { state, dispatch } = useAppStore();
  const { cards, currentPage } = state;
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  if (cards.length === 0) return null;

  const setPage = (idx: number) => {
    dispatch({ type: 'SET_CURRENT_PAGE', payload: idx });
  };

  const setCardType = (cardId: string, cardType: CardType) => {
    dispatch({ type: 'SET_CARD_TYPE', payload: { cardId, cardType } });
    setOpenDropdown(null);
  };

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-qc-text-tertiary uppercase tracking-wider">
          页面结构
        </span>
        <span className="text-xs text-qc-text-tertiary">{cards.length} 页</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {cards.map((card, idx) => (
          <div key={card.id} className="relative">
            <button
              onClick={() => setPage(idx)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all
                         border ${idx === currentPage
                ? 'border-transparent shadow-md'
                : 'border-qc-border-light hover:border-qc-border-medium bg-qc-elevated'
              }`}
              style={idx === currentPage ? {
                backgroundColor: TYPE_COLORS[card.type] + '18',
                color: TYPE_COLORS[card.type],
                borderColor: TYPE_COLORS[card.type] + '44',
              } : { color: '#787774' }}
            >
              <span>{TYPE_LABELS[card.type]}</span>
              {card.type === CardType.BODY && (
                <span className="opacity-60 text-[10px]">
                  {card.blocks.reduce((acc, b) => acc + b.text.length, 0)}字
                </span>
              )}
            </button>

            {/* F021 - 卡片类型切换下拉菜单 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdown(openDropdown === card.id ? null : card.id);
              }}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-qc-elevated border border-qc-border-light
                         flex items-center justify-center opacity-0 hover:opacity-100 group-hover:opacity-100
                         transition-opacity shadow-sm"
            >
              <ChevronDown size={8} className="text-qc-text-tertiary" />
            </button>

            {openDropdown === card.id && (
              <div className="absolute top-full left-0 mt-1 z-50 bg-qc-elevated border border-qc-border-light
                              rounded-lg shadow-qc-medium py-1 min-w-[100px]">
                {CARD_TYPE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setCardType(card.id, opt.value)}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-qc-hover transition-colors
                               ${card.type === opt.value ? 'text-qc-accent font-medium' : 'text-qc-text-secondary'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
