// F002 - 顶部工具栏：60px 高，Logo + 工具组 + 快捷键
import { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { historyManager } from '../../utils/historyManager';
import { exportAllCards } from '../../utils/exporter';
import { saveTemplate, loadTemplates } from '../../utils/templateManager';
import {
  Undo2, Redo2, ChevronLeft, ChevronRight,
  Download, Clock, ChevronDown, Package, BookmarkPlus, Check
} from 'lucide-react';

export function Toolbar() {
  const { state, dispatch, undo, redo, canUndo, canRedo } = useAppStore();
  const { cards, currentPage } = state;
  const [showHistory, setShowHistory] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'done'>('idle');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const goToPrev = () => dispatch({ type: 'SET_CURRENT_PAGE', payload: currentPage - 1 });
  const goToNext = () => dispatch({ type: 'SET_CURRENT_PAGE', payload: currentPage + 1 });

  const history = historyManager.getHistory();

  const handleExportAll = async () => {
    if (cards.length === 0) return;
    setShowExportMenu(false);

    const cardIds = cards.map(c => `export-card-${c.id}`);
    // Hard-fail if ExportRenderZone nodes aren't in the DOM
    const foundCount = cardIds.filter(id => document.getElementById(id)).length;
    if (foundCount === 0) {
      setExportStatus('idle');
      return;
    }

    setExportStatus('exporting');
    try {
      await exportAllCards(cardIds);
      setExportStatus('done');
      setTimeout(() => setExportStatus('idle'), 2000);
    } catch {
      setExportStatus('idle');
    }
  };

  const handleSaveTemplate = () => {
    saveTemplate(`我的模板 ${loadTemplates().length + 1}`, {
      style: state.style,
      font: state.font,
      theme: state.theme,
      exportRatio: state.exportRatio,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <header
      className="flex items-center px-4 gap-2 border-b border-qc-border-light flex-shrink-0 relative"
      style={{ height: 60, backgroundColor: '#FFFFFF' }}
    >
      {/* 翻页控制 */}
      <div className="flex items-center gap-1">
        <button
          onClick={goToPrev}
          disabled={currentPage <= 0}
          className="toolbar-btn disabled:opacity-30"
          title="上一页 [←]"
        >
          <ChevronLeft size={15} />
        </button>
        <button
          onClick={goToNext}
          disabled={currentPage >= cards.length - 1}
          className="toolbar-btn disabled:opacity-30"
          title="下一页 [→]"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* 撤销/重做 */}
      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="toolbar-btn disabled:opacity-30"
          title="撤销 Ctrl+Z"
        >
          <Undo2 size={14} />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="toolbar-btn disabled:opacity-30"
          title="重做 Ctrl+Shift+Z"
        >
          <Redo2 size={14} />
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* 保存模板 */}
      <button
        onClick={handleSaveTemplate}
        className="toolbar-btn flex items-center gap-1.5 px-3"
        title="保存当前风格为模板"
      >
        {saveSuccess ? (
          <>
            <Check size={14} className="text-qc-accent" />
            <span className="text-xs text-qc-accent">已保存</span>
          </>
        ) : (
          <>
            <BookmarkPlus size={14} />
            <span className="text-xs">保存模板</span>
          </>
        )}
      </button>

      {/* 历史记录 */}
      <div className="relative">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`toolbar-btn flex items-center gap-1.5 px-3 ${showHistory ? 'bg-qc-hover' : ''}`}
          title="查看操作历史"
        >
          <Clock size={14} />
          <span className="text-xs">历史</span>
          {history.length > 0 && (
            <span className="text-[10px] bg-qc-border-light rounded-full px-1.5 py-0.5 text-qc-text-tertiary">
              {history.length}
            </span>
          )}
        </button>

        {/* 历史记录下拉 (F038 历史管理 UI) */}
        {showHistory && (
          <div className="absolute top-full left-0 mt-1 z-50 w-64 bg-white border border-qc-border-light rounded-xl shadow-qc-medium overflow-hidden">
            <div className="px-3 py-2 border-b border-qc-border-light flex items-center justify-between">
              <span className="text-xs font-medium text-qc-text-secondary">操作历史</span>
              <span className="text-[10px] text-qc-text-tertiary">{history.length}/50 步</span>
            </div>
            {history.length === 0 ? (
              <div className="px-3 py-4 text-xs text-qc-text-tertiary text-center">
                暂无操作历史
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto">
                {[...history].reverse().map((entry, idx) => (
                  <button
                    key={entry.timestamp}
                    onClick={() => {
                      dispatch({ type: 'RESTORE_STATE', payload: entry.state });
                      setShowHistory(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-qc-hover transition-colors ${
                      idx === 0 ? 'text-qc-text-primary' : 'text-qc-text-tertiary'
                    }`}
                    title="点击跳转到此状态"
                  >
                    <div className="font-medium">{entry.label}</div>
                    <div className="text-[10px] opacity-60">
                      {new Date(entry.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      <span className="ml-1 opacity-60">← 恢复</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <div className="px-3 py-2 border-t border-qc-border-light">
              <button
                onClick={() => { undo(); setShowHistory(false); }}
                disabled={!canUndo}
                className="w-full text-xs text-qc-accent hover:text-qc-accent-hover disabled:opacity-40 text-left py-0.5"
              >
                ← 撤销上一步 (Ctrl+Z)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 手动更新按钮 - 触发重新计算 */}
      <button
        onClick={() => dispatch({ type: 'FORCE_RECOMPUTE' })}
        className="toolbar-btn flex items-center gap-1.5 px-3"
        title="手动更新预览"
      >
        <span className="text-xs">更新</span>
      </button>

      {/* 弹性空白 */}
      <div className="flex-1" />

      {/* 页码信息 */}
      {cards.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-qc-text-tertiary">
          <span>第 {currentPage + 1} 页</span>
          <span>/</span>
          <span className="font-medium text-qc-text-secondary">{cards.length} 页</span>
        </div>
      )}

      <div className="toolbar-divider" />

      {/* 导出全部 下拉 */}
      <div className="relative">
        <button
          onClick={() => setShowExportMenu(!showExportMenu)}
          disabled={cards.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-40 transition-colors"
          style={{ backgroundColor: '#7C8C3E' }}
          title="导出全部卡片"
        >
          {exportStatus === 'exporting' ? (
            <>
              <Package size={13} className="animate-pulse" />
              <span>导出中...</span>
            </>
          ) : exportStatus === 'done' ? (
            <>
              <Check size={13} />
              <span>已导出</span>
            </>
          ) : (
            <>
              <Download size={13} />
              <span>导出全部</span>
              <ChevronDown size={11} />
            </>
          )}
        </button>

        {showExportMenu && exportStatus === 'idle' && (
          <div className="absolute top-full right-0 mt-1 z-50 w-44 bg-white border border-qc-border-light rounded-xl shadow-qc-medium overflow-hidden">
            <button
              onClick={handleExportAll}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs hover:bg-qc-hover transition-colors text-qc-text-primary"
            >
              <Package size={13} className="text-qc-accent" />
              批量导出 ZIP
            </button>
            <button
              onClick={() => {
                setShowExportMenu(false);
                // 单页导出由 ExportPanel 处理
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs hover:bg-qc-hover transition-colors text-qc-text-primary border-t border-qc-border-light"
            >
              <Download size={13} className="text-qc-text-secondary" />
              在侧边栏单页导出
            </button>
          </div>
        )}
      </div>

      {/* 点击外部关闭菜单 */}
      {(showHistory || showExportMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setShowHistory(false); setShowExportMenu(false); }}
        />
      )}
    </header>
  );
}
