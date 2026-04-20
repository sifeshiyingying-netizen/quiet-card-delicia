// F025 / F055 - 封面设计弹窗 + 三种照片位置版式
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import { CoverConfig, CoverTemplate, COVER_COLOR_SCHEMES } from '../../types';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface CoverDesignerProps {
  isOpen: boolean;
  onClose: () => void;
}

const TEMPLATE_OPTIONS = [
  { id: CoverTemplate.MAGAZINE, name: '杂志版', desc: '标题居中，照片配图', hasPhoto: true },
  { id: CoverTemplate.PHOTO_BOTTOM, name: '照片下方', desc: '文字居上，大图置底', hasPhoto: true },
  { id: CoverTemplate.PHOTO_MIDDLE, name: '照片中部', desc: '三栏报头，图居中', hasPhoto: true },
  { id: CoverTemplate.PHOTO_FULL, name: '照片全屏', desc: '全屏大图，文字叠加', hasPhoto: true },
  { id: CoverTemplate.POSTER, name: '海报风', desc: '全版图文，冲击强', hasPhoto: true },
  { id: CoverTemplate.MINIMAL, name: '极简版', desc: '纯文字，高级感强', hasPhoto: false },
];

// 封面图片压缩 + 中心裁剪工具 (F030)
function compressAndCropImage(file: File, targetW = 800, targetH = 533, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d')!;

      // Center-crop: maintain aspect ratio of target, crop source
      const srcAspect = img.width / img.height;
      const tgtAspect = targetW / targetH;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (srcAspect > tgtAspect) {
        // Source is wider — crop sides
        sw = img.height * tgtAspect;
        sx = (img.width - sw) / 2;
      } else {
        // Source is taller — crop top/bottom
        sh = img.width / tgtAspect;
        sy = (img.height - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    img.src = objectUrl;
  });
}

function PhotoUploader({ value, onChange }: { value?: string; onChange: (url: string | undefined) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessing(true);
    try {
      const dataUrl = await compressAndCropImage(file);
      onChange(dataUrl);
    } catch {
      // Fallback: read as-is
      const reader = new FileReader();
      reader.onload = ev => onChange(ev.target?.result as string);
      reader.readAsDataURL(file);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <label className="block text-xs font-medium text-qc-text-secondary mb-2">封面照片（可选）</label>
      <div
        onClick={() => !processing && fileRef.current?.click()}
        className="w-full h-28 rounded-xl border-2 border-dashed border-qc-border-light hover:border-qc-accent
                   flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors
                   bg-qc-hover hover:bg-qc-accent-light overflow-hidden"
      >
        {processing ? (
          <>
            <Loader2 size={20} className="animate-spin text-qc-accent" />
            <span className="text-xs text-qc-text-tertiary">正在处理图片...</span>
          </>
        ) : value ? (
          <div className="relative w-full h-full">
            <img src={value} alt="封面照片" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white text-xs">更换图片</span>
            </div>
          </div>
        ) : (
          <>
            <ImageIcon size={20} className="text-qc-text-tertiary" />
            <span className="text-xs text-qc-text-tertiary">上传封面照片</span>
            <span className="text-[10px] text-qc-text-tertiary opacity-70">JPG / PNG，自动居中裁剪压缩</span>
          </>
        )}
      </div>
      {value && (
        <button
          onClick={() => onChange(undefined)}
          className="mt-1 text-xs text-red-400 hover:text-red-600 transition-colors"
        >
          移除照片
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
}

// 封面模板微型缩略图（左侧预览，随模板切换）
function MiniCoverPreview({
  template,
  scheme,
  title,
  journalName,
  image,
}: {
  template: CoverTemplate;
  scheme: typeof COVER_COLOR_SCHEMES[number];
  title: string;
  journalName: string;
  image?: string;
}) {
  const bg = scheme.background;
  const text = scheme.text;
  const accent = scheme.accent;
  const photoFilter = scheme.photoFilter;
  const imgEl = image ? (
    <img src={image} alt="" className="w-full h-full object-cover" style={{ filter: photoFilter }} />
  ) : (
    <div className="w-full h-full" style={{ backgroundColor: accent + '25' }} />
  );

  if (template === CoverTemplate.MAGAZINE) {
    // Photo top 50%, text bottom 50%
    return (
      <div className="w-full h-full flex flex-col" style={{ backgroundColor: bg }}>
        <div className="flex-[1.2] overflow-hidden">{imgEl}</div>
        <div className="flex-1 flex flex-col justify-center px-3 py-2">
          <div className="text-[5px] font-bold tracking-[0.25em] uppercase mb-1" style={{ color: accent }}>{journalName || 'JOURNAL'}</div>
          <div className="text-[8px] font-bold leading-tight" style={{ color: text }}>{title || '内容标题'}</div>
        </div>
      </div>
    );
  }
  if (template === CoverTemplate.PHOTO_BOTTOM) {
    // Text top 38%, photo bottom 62%
    return (
      <div className="w-full h-full flex flex-col" style={{ backgroundColor: bg }}>
        <div className="flex-[0.65] flex flex-col justify-between px-3 py-3">
          <div>
            <div className="text-[5px] tracking-[0.2em] uppercase mb-1.5" style={{ color: accent, opacity: 0.7 }}>{journalName || 'JOURNAL'}</div>
            <div className="text-[8px] font-bold leading-tight" style={{ color: text }}>{title || '内容标题'}</div>
          </div>
          <div className="text-[4px]" style={{ color: text, opacity: 0.4 }}>2026.04</div>
        </div>
        <div className="flex-1 overflow-hidden">{imgEl}</div>
      </div>
    );
  }
  if (template === CoverTemplate.PHOTO_MIDDLE) {
    // 3-col header, title, centered photo
    return (
      <div className="w-full h-full flex flex-col" style={{ backgroundColor: bg }}>
        <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: text + '20' }}>
          <div className="w-6 h-[3px] rounded" style={{ backgroundColor: text, opacity: 0.25 }} />
          <div className="text-[5px] font-bold tracking-[0.2em] uppercase" style={{ color: text }}>{journalName || 'JOURNAL'}</div>
          <div className="w-4 h-[3px] rounded" style={{ backgroundColor: text, opacity: 0.2 }} />
        </div>
        <div className="px-3 py-2">
          <div className="text-[7px] font-bold leading-tight text-center" style={{ color: text }}>"{title || '内容标题'}"</div>
        </div>
        <div className="flex-1 mx-3 mb-3 overflow-hidden rounded-lg">{imgEl}</div>
      </div>
    );
  }
  if (template === CoverTemplate.PHOTO_FULL) {
    // Full-bleed photo, title overlay bottom
    return (
      <div className="w-full h-full relative overflow-hidden" style={{ backgroundColor: '#1A1A1A' }}>
        <div className="absolute inset-0">{imgEl}</div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 50%)' }} />
        <div className="absolute top-2 left-0 right-0 flex justify-center">
          <div className="text-[4px] tracking-[0.25em] uppercase font-bold text-white/80">{journalName || 'JOURNAL'}</div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="text-[8px] font-bold leading-tight text-white">{title || '内容标题'}</div>
          <div className="text-[4px] mt-1 text-white/60">2026.04</div>
        </div>
      </div>
    );
  }
  if (template === CoverTemplate.POSTER) {
    // Bold photo background, centered text overlay — no accent tint applied
    return (
      <div className="w-full h-full relative overflow-hidden" style={{ backgroundColor: bg }}>
        {image && (
          <>
            <div className="absolute inset-0">{imgEl}</div>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.55) 100%)' }} />
          </>
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
          <div className="text-[5px] tracking-[0.25em] uppercase mb-1.5" style={{ color: image ? '#FFFFFF99' : accent, opacity: image ? 1 : 0.8 }}>{journalName || 'JOURNAL'}</div>
          <div className="w-6 h-px mb-1.5" style={{ backgroundColor: image ? '#FFFFFF50' : accent + '60' }} />
          <div className="text-[9px] font-bold leading-tight" style={{ color: image ? '#FFFFFF' : text }}>{title || '内容标题'}</div>
        </div>
      </div>
    );
  }
  // MINIMAL — pure text
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4" style={{ backgroundColor: bg }}>
      <div className="text-[5px] font-bold tracking-[0.3em] uppercase mb-3" style={{ color: accent }}>{journalName || 'JOURNAL'}</div>
      <div className="w-6 h-px mb-3" style={{ backgroundColor: accent }} />
      <div className="text-[9px] font-bold leading-tight text-center" style={{ color: text }}>{title || '内容标题'}</div>
    </div>
  );
}

export function CoverDesigner({ isOpen, onClose }: CoverDesignerProps) {
  const { state, dispatch } = useAppStore();
  const { coverConfig, journalConfig, theme } = state;

  const [localConfig, setLocalConfig] = useState<CoverConfig>(() => coverConfig || {
    template: CoverTemplate.MAGAZINE,
    colorScheme: 'warm',
    title: state.insights[0] || '',
    journalName: journalConfig.journalName,
    journalTagline: journalConfig.journalTagline,
    issueNumber: journalConfig.issueNumber,
    publishDate: journalConfig.publishDate,
  });

  const update = (partial: Partial<CoverConfig>) => {
    setLocalConfig(prev => ({ ...prev, ...partial }));
  };

  const handleSave = () => {
    dispatch({ type: 'SET_COVER_CONFIG', payload: localConfig });
    dispatch({ type: 'SET_JOURNAL_CONFIG', payload: {
      journalName: localConfig.journalName,
      journalTagline: localConfig.journalTagline,
      issueNumber: localConfig.issueNumber,
      publishDate: localConfig.publishDate,
    }});
    onClose();
  };

  const selectedScheme = COVER_COLOR_SCHEMES.find(s => s.id === localConfig.colorScheme)
    || COVER_COLOR_SCHEMES[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* 弹窗 */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="relative z-10 w-[680px] max-w-[95vw] max-h-[90vh] overflow-hidden
                       bg-qc-canvas rounded-2xl shadow-qc-large flex"
          >
            {/* 左侧预览 — 随模板/配色/照片实时变化 */}
            <div className="w-52 bg-qc-elevated border-r border-qc-border-light flex flex-col items-center justify-center p-6 gap-4">
              <div className="w-40 h-52 rounded-xl overflow-hidden shadow-qc-medium">
                <MiniCoverPreview
                  template={localConfig.template}
                  scheme={selectedScheme}
                  title={localConfig.title || '你的内容标题'}
                  journalName={localConfig.journalName || 'JOURNAL'}
                  image={localConfig.uploadedImage}
                />
              </div>
              <p className="text-xs text-qc-text-tertiary text-center">封面预览</p>
            </div>

            {/* 右侧配置 */}
            <div className="flex-1 overflow-y-auto flex flex-col">
              {/* 标题栏 */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-qc-border-light sticky top-0 bg-qc-canvas z-10">
                <h2 className="text-base font-semibold text-qc-text-primary">封面设计</h2>
                <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-qc-hover flex items-center justify-center transition-colors">
                  <X size={16} className="text-qc-text-secondary" />
                </button>
              </div>

              <div className="flex-1 p-6 space-y-6">
                {/* F027 / F055 - 封面模板选择（含3种照片版式） */}
                <div>
                  <label className="block text-xs font-medium text-qc-text-tertiary uppercase tracking-wider mb-3">
                    模板样式
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {TEMPLATE_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => update({ template: opt.id })}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          localConfig.template === opt.id
                            ? 'border-qc-accent bg-qc-accent-light'
                            : 'border-qc-border-light hover:border-qc-border-medium'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="text-xs font-semibold text-qc-text-primary">{opt.name}</div>
                          {opt.hasPhoto && (
                            <ImageIcon size={10} className="text-qc-text-tertiary flex-shrink-0" />
                          )}
                        </div>
                        <div className="text-[10px] text-qc-text-tertiary mt-0.5">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* F029 - 配色方案选择 */}
                <div>
                  <label className="block text-xs font-medium text-qc-text-tertiary uppercase tracking-wider mb-3">
                    配色方案
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {COVER_COLOR_SCHEMES.map(scheme => (
                      <button
                        key={scheme.id}
                        onClick={() => update({ colorScheme: scheme.id })}
                        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                          localConfig.colorScheme === scheme.id
                            ? 'border-qc-accent'
                            : 'border-qc-border-light hover:border-qc-border-medium'
                        }`}
                        title={scheme.name}
                      >
                        <div className="w-8 h-8 rounded-lg shadow-sm"
                          style={{ backgroundColor: scheme.background, border: `2px solid ${scheme.accent}33` }} />
                        <span className="text-[9px] text-qc-text-tertiary truncate w-full text-center">
                          {scheme.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* F030 - 封面照片 */}
                <PhotoUploader
                  value={localConfig.uploadedImage}
                  onChange={url => update({ uploadedImage: url })}
                />

                {/* F026 - 文字信息配置 */}
                <div>
                  <label className="block text-xs font-medium text-qc-text-tertiary uppercase tracking-wider mb-3">
                    文字信息
                  </label>
                  <div className="space-y-3">
                    <div>
                      <span className="block text-xs text-qc-text-secondary mb-1">封面标题</span>
                      <input
                        type="text"
                        value={localConfig.title}
                        onChange={e => update({ title: e.target.value })}
                        placeholder="你的内容标题"
                        className="notion-input w-full text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="block text-xs text-qc-text-secondary mb-1">期刊名称</span>
                        <input
                          type="text"
                          value={localConfig.journalName}
                          onChange={e => update({ journalName: e.target.value })}
                          placeholder="QUIET JOURNAL"
                          className="notion-input w-full text-sm"
                        />
                      </div>
                      <div>
                        <span className="block text-xs text-qc-text-secondary mb-1">期刊标语</span>
                        <input
                          type="text"
                          value={localConfig.journalTagline}
                          onChange={e => update({ journalTagline: e.target.value })}
                          placeholder="THE NOTES"
                          className="notion-input w-full text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="block text-xs text-qc-text-secondary mb-1">期号</span>
                        <input
                          type="text"
                          value={localConfig.issueNumber}
                          onChange={e => update({ issueNumber: e.target.value })}
                          placeholder="42"
                          className="notion-input w-full text-sm"
                        />
                      </div>
                      <div>
                        <span className="block text-xs text-qc-text-secondary mb-1">发布日期</span>
                        <input
                          type="date"
                          value={localConfig.publishDate}
                          onChange={e => update({ publishDate: e.target.value })}
                          className="notion-input w-full text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-qc-border-light text-sm text-qc-text-secondary
                             hover:bg-qc-hover transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
                  style={{ backgroundColor: '#7C8C3E' }}
                >
                  保存封面设计
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
