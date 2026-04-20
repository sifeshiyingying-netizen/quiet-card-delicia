// F013 - iPhone 模拟框 + F014 页码指示器 + F015 比例切换 + F016 智能提示框 + F019 卡片切换动画 + F039 空状态引导
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import { CardLayoutRenderer } from './CardLayout';
import { CardType, ExportRatio } from '../../types';
import { Info, Lightbulb, FileText, Download } from 'lucide-react';

const RATIO_CONFIGS: Record<ExportRatio, { label: string; aspectClass: string; aspect: [number, number] }> = {
  '4:3': { label: '4:3', aspectClass: 'aspect-[3/4]', aspect: [3, 4] },
  '15:9': { label: '15:9', aspectClass: 'aspect-[9/15]', aspect: [9, 15] },
  '1:1': { label: '1:1', aspectClass: 'aspect-square', aspect: [1, 1] },
};

const CARD_TYPE_LABELS: Record<CardType, string> = {
  [CardType.COVER]: '封面',
  [CardType.GUIDE]: '导读',
  [CardType.BODY]: '正文',
  [CardType.SUMMARY]: '总结',
  [CardType.CTA]: 'CTA',
};

function SmartCallout() {
  const { state } = useAppStore();
  const { cards, fullText, style } = state;

  if (!fullText.trim() && cards.length === 0) return null;

  const pageCount = cards.length;
  const styleLabels = { quiet: '静谧纸质感', editorial: '杂志风格', soft: '暖色调' };

  return (
    <div className="max-w-md w-full">
      <div className="flex items-start gap-3 px-4 py-3 bg-qc-accent-light border border-qc-accent/20 rounded-xl">
        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-qc-accent/15 flex items-center justify-center mt-0.5">
          <Info size={12} className="text-qc-accent" />
        </div>
        <div className="text-xs text-qc-text-secondary leading-relaxed">
          {pageCount > 0 ? (
            <>
              当前内容预计生成{' '}
              <span className="font-semibold text-qc-accent">{pageCount} 页</span>，
              建议使用{' '}
              <span className="font-semibold">4:3 比例</span>。{' '}
              {state.style === 'quiet' ? 'Quiet 风格' : styleLabels[state.style]}
              适合这类内容。
            </>
          ) : (
            <>输入核心观点和全文后，系统会自动生成卡片预览。</>
          )}
        </div>
      </div>
    </div>
  );
}

export function PhoneMockup() {
  const { state, dispatch } = useAppStore();
  const { cards, currentPage, exportRatio, journalConfig, font, theme, coverConfig, style: layoutStyle, fontSize } = state;

  const ratioConfig = RATIO_CONFIGS[exportRatio];
  const currentCard = cards[currentPage];
  const totalPages = Math.min(cards.length, 12); // 页码指示器最多显示 12 个

  const setPage = (idx: number) => {
    dispatch({ type: 'SET_CURRENT_PAGE', payload: idx });
  };

  const setRatio = (ratio: ExportRatio) => {
    dispatch({ type: 'SET_EXPORT_RATIO', payload: ratio });
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* iPhone 模拟框 */}
      <div className="relative">
        <div className="relative bg-qc-elevated rounded-[44px] p-[12px] shadow-qc-large"
          style={{ width: '390px' }}>
          {/* 刘海 */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-[#37352F] rounded-b-[18px] z-10" />

          {/* 卡片区域 */}
          <div className={`w-full ${ratioConfig.aspectClass} rounded-[36px] overflow-hidden relative`}
            style={{ backgroundColor: theme.paperColor }}>
            <AnimatePresence mode="wait">
              {currentCard ? (
                <motion.div
                  key={currentCard.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute inset-0"
                >
                  <CardLayoutRenderer
                    card={currentCard}
                    journalConfig={journalConfig}
                    font={font}
                    theme={theme}
                    logoUrl={journalConfig.logoUrl}
                    coverConfig={coverConfig}
                    id={`preview-card-${currentCard.id}`}
                    layoutStyle={layoutStyle}
                    fontSize={fontSize}
                  />
                </motion.div>
              ) : (
                // F039 - 空状态引导：分步操作提示 + 动效
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-6 gap-4"
                  style={{ backgroundColor: theme.paperColor }}
                >
                  {/* 品牌标识 */}
                  <div className="flex flex-col items-center gap-2 mb-1">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: theme.accentColor + '18' }}>
                      <span className="text-sm font-bold" style={{ color: theme.accentColor }}>Q</span>
                    </div>
                    <p className="text-[9px] tracking-[0.35em] uppercase font-semibold"
                      style={{ color: theme.accentColor }}>
                      {journalConfig.journalName}
                    </p>
                  </div>

                  {/* 三步操作指引 */}
                  <div className="w-full space-y-2">
                    {[
                      { icon: Lightbulb, label: '① 输入 3-5 个核心观点', color: theme.accentColor },
                      { icon: FileText, label: '② 粘贴 5000 字长文', color: '#8B7355' },
                      { icon: Download, label: '③ 选择风格后导出', color: '#6B8E7A' },
                    ].map(({ icon: Icon, label, color }, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + idx * 0.08, duration: 0.3 }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
                        style={{ backgroundColor: color + '10' }}
                      >
                        <Icon size={12} style={{ color, flexShrink: 0 }} />
                        <span className="text-[10px] leading-tight" style={{ color: '#4A4540' }}>
                          {label}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  <p className="text-[9px] text-center leading-relaxed"
                    style={{ color: theme.accentColor + '80' }}>
                    系统将自动生成 10-15 张期刊卡片
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 页码指示器 */}
      {cards.length > 0 && (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: Math.min(cards.length, totalPages) }).map((_, idx) => (
              <motion.button
                key={idx}
                onClick={() => setPage(idx)}
                className="h-1.5 rounded-full cursor-pointer"
                animate={{
                  width: idx === currentPage ? 24 : 6,
                  backgroundColor: idx === currentPage ? '#7C8C3E' : '#D3D2CE',
                }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xs text-qc-text-tertiary">
              第 {currentPage + 1} 页 / 共 {cards.length} 页
            </p>
            {currentCard && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-qc-hover text-qc-text-tertiary">
                {CARD_TYPE_LABELS[currentCard.type]}
              </span>
            )}
          </div>
        </div>
      )}

      {/* 比例切换 */}
      <div className="flex items-center gap-1 bg-qc-hover p-1 rounded-lg">
        {(Object.keys(RATIO_CONFIGS) as ExportRatio[]).map(ratio => (
          <button
            key={ratio}
            onClick={() => setRatio(ratio)}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
              exportRatio === ratio
                ? 'bg-qc-elevated text-qc-accent shadow-qc-subtle'
                : 'text-qc-text-secondary hover:text-qc-text-primary'
            }`}
          >
            {ratio}
          </button>
        ))}
      </div>

      {/* 智能提示框 */}
      <SmartCallout />
    </div>
  );
}
