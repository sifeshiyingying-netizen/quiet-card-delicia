// Main App - Delicia Quiet Card
import { useState, useEffect, useRef, useCallback } from 'react';
// Note: useState kept for sidebarWidth
import { motion, AnimatePresence } from 'framer-motion';
import { AppProvider, useAppStore } from './store/appStore';
import { Sidebar } from './components/editor/Sidebar';
import { Toolbar } from './components/editor/Toolbar';
import { PhoneMockup } from './components/preview/PhoneMockup';
import { PageStructurePreview } from './components/preview/PageStructurePreview';
import { ExportRenderZone } from './components/export/ExportRenderZone';
import { initFonts } from './utils/fontLoader';

const MIN_SIDEBAR = 280;
const MAX_SIDEBAR = 640;
const DEFAULT_SIDEBAR = 380;

function AppContent() {
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR);
  const { state, dispatch } = useAppStore();
  const { cards, currentPage } = state;

  // F054 - 拖拽分隔条
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(DEFAULT_SIDEBAR);

  const onDragMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return;
    const delta = e.clientX - dragStartX.current;
    const newWidth = Math.min(MAX_SIDEBAR, Math.max(MIN_SIDEBAR, dragStartWidth.current + delta));
    setSidebarWidth(newWidth);
  }, []);

  const onDragMouseUp = useCallback(() => {
    isDragging.current = false;
    document.removeEventListener('mousemove', onDragMouseMove);
    document.removeEventListener('mouseup', onDragMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [onDragMouseMove]);

  const onDragMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartWidth.current = sidebarWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onDragMouseMove);
    document.addEventListener('mouseup', onDragMouseUp);
  }, [sidebarWidth, onDragMouseMove, onDragMouseUp]);

  // F038 - 键盘方向键翻页
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        dispatch({ type: 'SET_CURRENT_PAGE', payload: currentPage + 1 });
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        dispatch({ type: 'SET_CURRENT_PAGE', payload: currentPage - 1 });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentPage, dispatch]);

  return (
    <div className="h-screen flex overflow-hidden bg-qc-canvas">
      {/* 左侧边栏 */}
      <Sidebar width={sidebarWidth} />

      {/* F054 - 拖拽分隔条 */}
      <div
        onMouseDown={onDragMouseDown}
        className="flex-shrink-0 flex items-center justify-center cursor-col-resize group z-10"
        style={{ width: 8, background: 'transparent' }}
        title="拖拽调整宽度"
      >
        <div
          className="h-full w-px transition-colors"
          style={{ backgroundColor: 'var(--qc-border-light)' }}
        />
        <div
          className="absolute w-4 h-12 rounded-full flex items-center justify-center
                     opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ backgroundColor: 'var(--qc-border-medium)' }}
        >
          <div className="flex flex-col gap-0.5">
            <div className="w-px h-3 rounded-full bg-white/70" />
            <div className="w-px h-3 rounded-full bg-white/70" />
          </div>
        </div>
      </div>

      {/* 右侧主区域 */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* 顶部工具栏 */}
        <Toolbar />

        {/* 主内容区：手机预览 + 分页预览 */}
        <main className="flex-1 overflow-y-auto" style={{ backgroundColor: '#F2F0ED' }}>
          <div className="min-h-full flex flex-col items-center justify-start py-10 gap-8 px-6">
            {/* 手机模拟框 */}
            <PhoneMockup />

            {/* 分页结构预览 */}
            <AnimatePresence>
              {cards.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, delay: 0.1 }}
                >
                  <PageStructurePreview />
                </motion.div>
              )}
            </AnimatePresence>

            {/* 键盘快捷键提示 */}
            {cards.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-4 text-[10px] text-qc-text-tertiary"
                style={{ opacity: 0.6 }}
              >
                <span>← → 翻页</span>
                <span>Ctrl+Z 撤销</span>
                <span>Ctrl+Shift+Z 重做</span>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* F033 - 全尺寸导出渲染区（必须常驻于根节点，不随 accordion 折叠卸载） */}
      <ExportRenderZone />
    </div>
  );
}

function App() {
  useEffect(() => {
    initFonts().catch(() => {});
  }, []);

  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
