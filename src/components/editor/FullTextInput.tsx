// F007 - 全文粘贴区 + F009 内容块类型调整 + F023 手动分段
import { useAppStore } from '../../store/appStore';
import { historyManager } from '../../utils/historyManager';
import { BlockType } from '../../types';
import { AlertTriangle, CheckCircle, ChevronDown, Scissors } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  H1: 'H1 一级',
  H2: 'H2 二级',
  P: 'P 正文',
};

export function FullTextInput() {
  const { state, dispatch } = useAppStore();
  const { fullText, contentBlocks } = state;
  const [showBlocks, setShowBlocks] = useState(contentBlocks.length > 0);
  const prevBlockCount = useRef(contentBlocks.length);

  // Auto-expand block panel when blocks first appear after pasting
  useEffect(() => {
    if (prevBlockCount.current === 0 && contentBlocks.length > 0) {
      setShowBlocks(true);
    }
    prevBlockCount.current = contentBlocks.length;
  }, [contentBlocks.length]);

  const [lastSavedText, setLastSavedText] = useState(fullText);

  const handleChange = (value: string) => {
    // 使用防抖更新，避免每次按键都触发重新计算
    dispatch({ type: 'SET_FULL_TEXT_NO_RECOMPUTE', payload: value });
  };

  const handleBlur = () => {
    // Push pre-change snapshot: save state with the old text value
    if (fullText !== lastSavedText) {
      historyManager.push('修改全文', { ...state, fullText: lastSavedText });
      setLastSavedText(fullText);
    }
  };

  const handleBlockTypeChange = (blockId: string, blockType: BlockType) => {
    historyManager.push('调整块类型', state);
    dispatch({ type: 'UPDATE_BLOCK_TYPE', payload: { id: blockId, blockType } });
  };

  // F023 - 手动分段：在段落中点切断（从中间位置分割 P 块）
  const handleSplitBlock = (blockId: string, text: string) => {
    const mid = Math.floor(text.length / 2);
    // Find nearest sentence boundary near middle
    const searchText = text.slice(0, mid + 50);
    const lastBoundary = Math.max(
      searchText.lastIndexOf('。'),
      searchText.lastIndexOf('！'),
      searchText.lastIndexOf('？'),
      searchText.lastIndexOf('\n'),
    );
    const pos = lastBoundary > 0 ? lastBoundary + 1 : mid;
    historyManager.push('手动分段', state);
    dispatch({ type: 'SPLIT_BLOCK', payload: { blockId, position: pos } });
  };

  const charCount = fullText.length;
  const isShort = charCount > 0 && charCount < 3000;
  const isGood = charCount >= 3000;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-medium text-qc-text-tertiary uppercase tracking-wider">
          全文粘贴
        </label>
        {contentBlocks.length > 0 && (
          <button
            onClick={() => setShowBlocks(!showBlocks)}
            className="flex items-center gap-1 text-xs text-qc-text-tertiary hover:text-qc-accent transition-colors"
          >
            {showBlocks ? '收起' : `${contentBlocks.length} 段`}
            <ChevronDown
              size={12}
              className={`transition-transform ${showBlocks ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>

      <textarea
        value={fullText}
        onChange={e => handleChange(e.target.value)}
        onBlur={handleBlur}
        placeholder="粘贴你的长文章内容...&#10;&#10;支持自动识别：一、二、三（H1标题）、1.1（H2标题）、其余文字（P正文）"
        rows={10}
        className="notion-input w-full resize-y font-sans text-sm leading-relaxed"
      />

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1.5 text-xs">
          {isShort ? (
            <>
              <AlertTriangle size={12} className="text-amber-500" />
              <span className="text-amber-600">建议补充到 5000 字（当前 {charCount} 字）</span>
            </>
          ) : isGood ? (
            <>
              <CheckCircle size={12} className="text-qc-accent" />
              <span className="text-qc-accent">{charCount} 字</span>
            </>
          ) : (
            <span className="text-qc-text-tertiary">0 字</span>
          )}
        </div>
      </div>

      {/* F009 - 内容块类型调整 + F023 - 手动分段 */}
      {showBlocks && contentBlocks.length > 0 && (
        <div className="mt-3 border border-qc-border-light rounded-lg overflow-hidden">
          <div className="px-3 py-2 bg-qc-hover border-b border-qc-border-light flex items-center justify-between">
            <span className="text-xs font-medium text-qc-text-tertiary">标题识别结果（可手动调整/分段）</span>
          </div>
          <div className="max-h-48 overflow-y-auto divide-y divide-qc-border-light">
            {contentBlocks.map(block => (
              <div key={block.id} className="flex items-center gap-2 px-3 py-2 hover:bg-qc-hover group">
                <div className="flex-1 text-xs text-qc-text-primary truncate min-w-0">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 flex-shrink-0 ${
                    block.type === 'H1' ? 'bg-qc-accent' :
                    block.type === 'H2' ? 'bg-qc-text-secondary' : 'bg-qc-border-medium'
                  }`} />
                  {block.text.slice(0, 40)}{block.text.length > 40 ? '...' : ''}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <select
                    value={block.type}
                    onChange={e => handleBlockTypeChange(block.id, e.target.value as BlockType)}
                    className="text-xs border border-qc-border-light rounded px-1.5 py-0.5 bg-white text-qc-text-secondary
                               hover:border-qc-border-medium focus:border-qc-accent focus:outline-none cursor-pointer"
                  >
                    {Object.entries(BLOCK_TYPE_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                  {/* F023 - 手动分段按钮（仅 P 块且文字较长时显示） */}
                  {block.type === 'P' && block.text.length > 100 && (
                    <button
                      onClick={() => handleSplitBlock(block.id, block.text)}
                      className="p-1 rounded text-qc-text-tertiary hover:text-qc-accent hover:bg-qc-accent-light transition-colors opacity-0 group-hover:opacity-100"
                      title="在中间分段（F023 手动分页）"
                    >
                      <Scissors size={11} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="px-3 py-1.5 bg-qc-hover border-t border-qc-border-light">
            <span className="text-[10px] text-qc-text-tertiary">✂ 悬停长段可点击剪刀手动分段</span>
          </div>
        </div>
      )}
    </section>
  );
}
