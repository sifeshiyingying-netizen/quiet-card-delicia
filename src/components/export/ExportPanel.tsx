// F031 / F032 / F033 - 导出面板（带动效进度弹窗）
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import { exportCard, exportAllCards } from '../../utils/exporter';
import { Download, Package, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

type ExportStatus = 'idle' | 'exporting' | 'success' | 'error';

interface ProgressState {
  current: number;
  total: number;
}

// F033 - 导出进度弹窗（居中 Modal + 动效进度条）
function ExportProgressModal({
  isOpen,
  status,
  progress,
  errorMessage,
  onClose,
}: {
  isOpen: boolean;
  status: ExportStatus;
  progress: ProgressState;
  errorMessage: string;
  onClose: () => void;
}) {
  const percent = progress.total > 0
    ? Math.round((progress.current / progress.total) * 100)
    : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 12 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="relative z-10 bg-qc-canvas rounded-2xl shadow-qc-large p-8 w-80 flex flex-col items-center gap-5"
          >
            {status === 'exporting' && (
              <>
                <Loader2 size={32} className="animate-spin text-qc-accent" />
                <div className="w-full text-center">
                  <div className="text-sm font-medium text-qc-text-primary mb-1">
                    {progress.total > 0
                      ? `正在导出 ${progress.current}/${progress.total} 张...`
                      : '正在导出...'}
                  </div>
                  {progress.total > 0 && (
                    <div className="w-full h-2 bg-qc-border-light rounded-full overflow-hidden mt-3">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: '#7C8C3E' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ ease: 'easeOut', duration: 0.3 }}
                      />
                    </div>
                  )}
                  <div className="text-xs text-qc-text-tertiary mt-2">请勿关闭页面</div>
                </div>
              </>
            )}
            {status === 'success' && (
              <>
                <CheckCircle size={36} className="text-green-500" />
                <div className="text-sm font-medium text-qc-text-primary">导出成功！</div>
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-xl bg-qc-accent-light text-qc-accent text-sm font-medium hover:bg-qc-accent hover:text-white transition-colors"
                >
                  完成
                </button>
              </>
            )}
            {status === 'error' && (
              <>
                <AlertCircle size={36} className="text-red-500" />
                <div className="text-sm font-medium text-red-600">{errorMessage}</div>
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-xl border border-red-200 text-red-600 text-sm hover:bg-red-50 transition-colors"
                >
                  关闭
                </button>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function ExportPanel() {
  const { state } = useAppStore();
  const { cards, currentPage } = state;
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [progress, setProgress] = useState<ProgressState>({ current: 0, total: 0 });
  const [errorMessage, setErrorMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const isExporting = status === 'exporting';

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => setStatus('idle'), 200);
  };

  // F031 - 导出当前页
  const exportCurrentCard = async () => {
    const currentCard = cards[currentPage];
    if (!currentCard) return;

    const exportEl = document.getElementById(`export-card-${currentCard.id}`);
    const previewEl = document.getElementById(`preview-card-${currentCard.id}`);
    const element = exportEl || previewEl;

    if (!element) {
      setErrorMessage('找不到卡片元素，请确认预览已加载');
      setStatus('error');
      setShowModal(true);
      return;
    }

    setStatus('exporting');
    setProgress({ current: 0, total: 0 });
    setShowModal(true);
    try {
      const blob = await exportCard(element);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quietcard-${String(currentPage + 1).padStart(2, '0')}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus('success');
    } catch {
      setErrorMessage('导出失败，请重试');
      setStatus('error');
    }
  };

  // F032 - 批量导出所有卡片
  const exportAll = async () => {
    if (cards.length === 0) return;

    const cardIds = cards.map(c => `export-card-${c.id}`);

    // Hard-fail early if no export DOM nodes are found (render zone not mounted)
    const foundCount = cardIds.filter(id => document.getElementById(id)).length;
    if (foundCount === 0) {
      setErrorMessage('导出节点未加载，请稍候再试');
      setStatus('error');
      setShowModal(true);
      return;
    }

    setStatus('exporting');
    setProgress({ current: 0, total: cards.length });
    setShowModal(true);

    try {
      await exportAllCards(cardIds, (current, total) => {
        setProgress({ current, total });
      });
      setStatus('success');
    } catch {
      setErrorMessage('批量导出失败，请重试');
      setStatus('error');
    }
  };

  const canExport = cards.length > 0;

  return (
    <>
      {/* F033 - 导出进度弹窗（ExportRenderZone 已移至 App 根节点，常驻挂载） */}
      <ExportProgressModal
        isOpen={showModal}
        status={status}
        progress={progress}
        errorMessage={errorMessage}
        onClose={closeModal}
      />

      <div className="space-y-4">
        <div className="space-y-2">
          <button
            onClick={exportCurrentCard}
            disabled={!canExport || isExporting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-qc-border-light
                       text-sm text-qc-text-secondary hover:bg-qc-hover hover:border-qc-border-medium
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Download size={14} />
            导出当前页（PNG）
          </button>

          <button
            onClick={exportAll}
            disabled={!canExport || isExporting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                       text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{ backgroundColor: '#7C8C3E' }}
          >
            <Package size={14} />
            批量导出全部（ZIP）
          </button>
        </div>

        <p className="text-xs text-qc-text-tertiary text-center leading-relaxed">
          导出分辨率 1080px 宽（排版与预览完全一致），适合小红书发布
        </p>
      </div>
    </>
  );
}
