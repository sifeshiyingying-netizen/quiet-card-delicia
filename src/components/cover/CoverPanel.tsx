// F025/F026/F029/F030/F035/F055 — 统一封面设计面板（侧边栏版，实时预览）
import { useRef, useState, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import {
  CoverConfig, CoverTemplate, COVER_COLOR_SCHEMES,
} from '../../types';
import { Image as ImageIcon, Loader2, Upload } from 'lucide-react';

// ─── 封面模板选项 ─────────────────────────────────────────────────────────────
const TEMPLATE_OPTIONS = [
  { id: CoverTemplate.MAGAZINE,       name: '杂志版',       desc: '图上文下' },
  { id: CoverTemplate.PHOTO_BOTTOM,  name: '图片下方',     desc: '文上大图底' },
  { id: CoverTemplate.PHOTO_MIDDLE,  name: '图片中部',     desc: '三栏居中图' },
  { id: CoverTemplate.PHOTO_FULL,    name: '图片全屏',     desc: '全屏叠字' },
  { id: CoverTemplate.PHOTO_TOP_FILL, name: '图片上半填充', desc: '图片填上半' },
  { id: CoverTemplate.POSTER,        name: '海报风',       desc: '全版冲击' },
  { id: CoverTemplate.MINIMAL,       name: '极简版',       desc: '纯文高级感' },
];

// ─── 图片压缩裁剪工具 (F030) ──────────────────────────────────────────────────
function compressAndCropImage(file: File, w = 800, h = 533, q = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      const srcA = img.width / img.height;
      const tgtA = w / h;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (srcA > tgtA) { sw = img.height * tgtA; sx = (img.width - sw) / 2; }
      else { sh = img.width / tgtA; sy = (img.height - sh) / 2; }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', q));
    };
    img.onerror = reject;
    img.src = url;
  });
}

// ─── 自定义色号行 ─────────────────────────────────────────────────────────────
function HexRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [raw, setRaw] = useState(value);
  const colorRef = useRef<HTMLInputElement>(null);
  const isValid = /^#[0-9A-Fa-f]{6}$/.test(raw);

  useEffect(() => { setRaw(value); }, [value]);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => colorRef.current?.click()}
        className="w-5 h-5 rounded border border-qc-border-medium flex-shrink-0"
        style={{ backgroundColor: isValid ? raw : value }}
      />
      <input ref={colorRef} type="color" value={isValid ? raw : value}
        onChange={e => { setRaw(e.target.value); onChange(e.target.value); }}
        className="sr-only" tabIndex={-1} />
      <span className="text-[10px] text-qc-text-tertiary w-12 flex-shrink-0">{label}</span>
      <input
        type="text" value={raw} maxLength={7} placeholder="#RRGGBB"
        onChange={e => { setRaw(e.target.value); if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) onChange(e.target.value); }}
        className={`flex-1 text-[11px] font-mono px-2 py-0.5 rounded border outline-none ${
          isValid ? 'border-qc-border-light bg-white' : 'border-red-300 bg-red-50 text-red-600'
        }`}
      />
    </div>
  );
}

// ─── 微型封面预览 (MiniCoverPreview) ─────────────────────────────────────────
function MiniPreview({ cfg, journalName }: { cfg: CoverConfig; journalName: string }) {
  const scheme = cfg.colorScheme === 'custom' && cfg.customScheme
    ? cfg.customScheme
    : COVER_COLOR_SCHEMES.find(s => s.id === cfg.colorScheme) || COVER_COLOR_SCHEMES[0];

  const bg = scheme.background;
  const text = scheme.text;
  const accent = scheme.accent;
  const photoFilter = ('photoFilter' in scheme ? (scheme as { photoFilter?: string }).photoFilter : undefined);
  const title = cfg.title || '你的标题';
  const name = cfg.journalName || journalName || 'JOURNAL';

  const imgEl = cfg.uploadedImage ? (
    <img src={cfg.uploadedImage} alt="" className="w-full h-full object-cover" style={{ filter: photoFilter }} />
  ) : (
    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: accent + '25' }}>
      <ImageIcon size={12} className="opacity-30" />
    </div>
  );

  if (cfg.template === CoverTemplate.MAGAZINE) return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: bg }}>
      <div className="flex-[1.2] overflow-hidden">{imgEl}</div>
      <div className="flex-1 flex flex-col justify-center px-2 py-1">
        <div className="text-[4px] font-bold tracking-[0.2em] uppercase mb-0.5" style={{ color: accent }}>{name}</div>
        <div className="text-[6px] font-bold leading-tight" style={{ color: text }}>{title}</div>
      </div>
    </div>
  );
  if (cfg.template === CoverTemplate.PHOTO_BOTTOM) return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: bg }}>
      <div className="flex-[0.65] flex flex-col justify-between px-2 py-2">
        <div>
          <div className="text-[4px] tracking-[0.15em] uppercase mb-1" style={{ color: accent, opacity: 0.7 }}>{name}</div>
          <div className="text-[6px] font-bold leading-tight" style={{ color: text }}>{title}</div>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">{imgEl}</div>
    </div>
  );
  if (cfg.template === CoverTemplate.PHOTO_MIDDLE) return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: bg }}>
      <div className="flex items-center justify-center px-2 py-1.5 border-b" style={{ borderColor: text + '20' }}>
        <div className="text-[4px] font-bold tracking-[0.15em] uppercase" style={{ color: text }}>{name}</div>
      </div>
      <div className="px-2 py-1">
        <div className="text-[5px] font-bold leading-tight text-center" style={{ color: text }}>"{title}"</div>
      </div>
      <div className="flex-1 mx-2 mb-2 overflow-hidden rounded">{imgEl}</div>
    </div>
  );
  if (cfg.template === CoverTemplate.PHOTO_FULL) return (
    <div className="w-full h-full relative overflow-hidden" style={{ backgroundColor: '#1A1A1A' }}>
      <div className="absolute inset-0">{imgEl}</div>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(0,0,0,.65) 0%,transparent 55%)' }} />
      <div className="absolute top-1.5 left-0 right-0 flex justify-center">
        <div className="text-[3px] tracking-[0.2em] uppercase font-bold text-white/80">{name}</div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-2">
        <div className="text-[6px] font-bold leading-tight text-white">{title}</div>
      </div>
    </div>
  );
  if (cfg.template === CoverTemplate.PHOTO_TOP_FILL) return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: bg }}>
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0">{imgEl}</div>
        <div className="absolute top-0 left-0 right-0 p-1 bg-gradient-to-b from-black/20 to-transparent">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-[3px] tracking-[0.15em] uppercase opacity-80" style={{ color: '#FFFFFF' }}>{name}</div>
            </div>
            <div className="w-2 h-2 rounded-full bg-white/30" />
          </div>
        </div>
      </div>
      <div className="h-[35%] flex flex-col justify-center items-center px-1 py-1">
        <div className="text-[4px] font-bold leading-tight text-center" style={{ color: text }}>{title}</div>
      </div>
    </div>
  );
  if (cfg.template === CoverTemplate.POSTER) return (
    <div className="w-full h-full relative overflow-hidden" style={{ backgroundColor: bg }}>
      {cfg.uploadedImage && (
        <>
          <div className="absolute inset-0">{imgEl}</div>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom,rgba(0,0,0,.3) 0%,rgba(0,0,0,.55) 100%)' }} />
        </>
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
        <div className="text-[4px] tracking-[0.2em] uppercase mb-1" style={{ color: cfg.uploadedImage ? 'rgba(255,255,255,0.7)' : accent }}>{name}</div>
        <div className="w-5 h-px mb-1" style={{ backgroundColor: cfg.uploadedImage ? 'rgba(255,255,255,0.4)' : accent + '60' }} />
        <div className="text-[7px] font-bold leading-tight" style={{ color: cfg.uploadedImage ? '#FFF' : text }}>{title}</div>
      </div>
    </div>
  );
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-3" style={{ backgroundColor: bg }}>
      <div className="text-[4px] font-bold tracking-[0.25em] uppercase mb-2" style={{ color: accent }}>{name}</div>
      <div className="w-5 h-px mb-2" style={{ backgroundColor: accent }} />
      <div className="text-[7px] font-bold leading-tight text-center" style={{ color: text }}>{title}</div>
    </div>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────
export function CoverPanel() {
  const { state, dispatch } = useAppStore();
  const { journalConfig, coverConfig, insights } = state;
  const fileRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const [photoProcessing, setPhotoProcessing] = useState(false);

  // 初始化 coverConfig（如果不存在）
  const cfg: CoverConfig = coverConfig || {
    template: CoverTemplate.MAGAZINE,
    colorScheme: 'warm',
    title: insights[0] || '',
    journalName: journalConfig.journalName,
    journalTagline: journalConfig.journalTagline,
    issueNumber: journalConfig.issueNumber,
    publishDate: journalConfig.publishDate,
  };

  // 统一更新：coverConfig + journalConfig 同步
  const update = (partial: Partial<CoverConfig>) => {
    const next = { ...cfg, ...partial };
    dispatch({ type: 'SET_COVER_CONFIG', payload: next });
    // 同步到 journalConfig
    const journalPartial: Record<string, string> = {};
    if (partial.journalName !== undefined) journalPartial.journalName = partial.journalName;
    if (partial.journalTagline !== undefined) journalPartial.journalTagline = partial.journalTagline;
    if (partial.issueNumber !== undefined) journalPartial.issueNumber = partial.issueNumber;
    if (partial.publishDate !== undefined) journalPartial.publishDate = partial.publishDate;
    if (Object.keys(journalPartial).length > 0) {
      dispatch({ type: 'SET_JOURNAL_CONFIG', payload: journalPartial });
    }
  };

  // 初次挂载时同步 journalConfig → coverConfig
  useEffect(() => {
    if (!coverConfig) {
      dispatch({ type: 'SET_COVER_CONFIG', payload: cfg });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isCustom = cfg.colorScheme === 'custom';
  const customScheme = cfg.customScheme || { background: '#F5F5F0', text: '#1A1A1A', accent: '#7C8C3E' };

  // 照片上传
  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoProcessing(true);
    try {
      const dataUrl = await compressAndCropImage(file);
      update({ uploadedImage: dataUrl });
    } catch {
      const reader = new FileReader();
      reader.onload = ev => update({ uploadedImage: ev.target?.result as string });
      reader.readAsDataURL(file);
    } finally {
      setPhotoProcessing(false);
    }
  };

  // Logo 上传
  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => dispatch({ type: 'SET_JOURNAL_CONFIG', payload: { logoUrl: ev.target?.result as string } });
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">
      {/* 封面实时预览 */}
      <div className="flex justify-center">
        <div className="w-[108px] h-[144px] rounded-lg overflow-hidden shadow-qc-medium border border-qc-border-light">
          <MiniPreview cfg={cfg} journalName={journalConfig.journalName} />
        </div>
      </div>

      {/* 版式选择 */}
      <section>
        <label className="block text-xs font-medium text-qc-text-tertiary uppercase tracking-wider mb-2">
          版式
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {TEMPLATE_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => update({ template: opt.id })}
              className={`px-2 py-2 rounded-lg border text-center transition-all ${
                cfg.template === opt.id
                  ? 'border-qc-accent bg-qc-accent-light text-qc-accent'
                  : 'border-qc-border-light hover:border-qc-border-medium text-qc-text-secondary'
              }`}
            >
              <div className="text-[11px] font-semibold leading-tight">{opt.name}</div>
              <div className="text-[9px] opacity-60 mt-0.5 leading-tight">{opt.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* 配色方案 */}
      <section>
        <label className="block text-xs font-medium text-qc-text-tertiary uppercase tracking-wider mb-2">
          配色
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {COVER_COLOR_SCHEMES.map(s => (
            <button
              key={s.id}
              onClick={() => update({ colorScheme: s.id })}
              title={s.name}
              className={`flex flex-col items-center gap-1 px-1.5 py-2 rounded-lg border transition-all ${
                cfg.colorScheme === s.id && !isCustom
                  ? 'border-qc-accent bg-qc-accent-light'
                  : 'border-qc-border-light hover:border-qc-border-medium'
              }`}
            >
              <div className="w-7 h-7 rounded-md shadow-sm flex-shrink-0"
                style={{ backgroundColor: s.background, border: `2px solid ${s.accent}55` }} />
              <span className="text-[9px] text-qc-text-tertiary leading-tight text-center truncate w-full">{s.name}</span>
            </button>
          ))}
          {/* 自定义 */}
          <button
            onClick={() => update({ colorScheme: 'custom', customScheme: customScheme })}
            title="自定义色号"
            className={`flex flex-col items-center gap-1 px-1.5 py-2 rounded-lg border transition-all ${
              isCustom ? 'border-qc-accent bg-qc-accent-light' : 'border-dashed border-qc-border-light hover:border-qc-border-medium'
            }`}
          >
            <div className="w-7 h-7 rounded-md border border-qc-border-light flex items-center justify-center"
              style={isCustom ? { backgroundColor: customScheme.background } : {}}>
              {!isCustom && <span className="text-sm text-qc-text-tertiary">＋</span>}
            </div>
            <span className="text-[9px] text-qc-text-tertiary leading-tight text-center">自定义</span>
          </button>
        </div>

        {/* 自定义色号输入 */}
        {isCustom && (
          <div className="mt-2 p-2.5 rounded-lg border border-qc-accent/30 bg-qc-accent-light/40 space-y-1.5">
            <p className="text-[10px] text-qc-text-tertiary uppercase tracking-wide mb-1">自定义色号</p>
            <HexRow label="底色" value={customScheme.background}
              onChange={v => update({ customScheme: { ...customScheme, background: v } })} />
            <HexRow label="文字" value={customScheme.text}
              onChange={v => update({ customScheme: { ...customScheme, text: v } })} />
            <HexRow label="强调色" value={customScheme.accent}
              onChange={v => update({ customScheme: { ...customScheme, accent: v } })} />
          </div>
        )}
      </section>

      {/* 封面图片 */}
      <section>
        <label className="block text-xs font-medium text-qc-text-tertiary uppercase tracking-wider mb-2">
          封面图片（可选）
        </label>
        <div
          onClick={() => !photoProcessing && fileRef.current?.click()}
          className="w-full h-24 rounded-xl border-2 border-dashed border-qc-border-light
                     hover:border-qc-accent flex flex-col items-center justify-center gap-1.5
                     cursor-pointer transition-colors bg-qc-hover hover:bg-qc-accent-light overflow-hidden"
        >
          {photoProcessing ? (
            <><Loader2 size={18} className="animate-spin text-qc-accent" /><span className="text-[11px] text-qc-text-tertiary">处理中...</span></>
          ) : cfg.uploadedImage ? (
            <div className="relative w-full h-full">
              <img src={cfg.uploadedImage} alt="封面" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-xs">更换图片</span>
              </div>
            </div>
          ) : (
            <><ImageIcon size={18} className="text-qc-text-tertiary" /><span className="text-[11px] text-qc-text-tertiary">上传封面图片</span><span className="text-[10px] text-qc-text-tertiary opacity-60">JPG/PNG，自动居中裁剪</span></>
          )}
        </div>
        {cfg.uploadedImage && (
          <button onClick={() => update({ uploadedImage: undefined })}
            className="mt-1 text-xs text-red-400 hover:text-red-600 transition-colors">
            移除图片
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
      </section>

      {/* 内容信息 */}
      <section>
        <label className="block text-xs font-medium text-qc-text-tertiary uppercase tracking-wider mb-2">
          内容信息
        </label>
        <div className="space-y-2">
          <div>
            <span className="block text-[11px] text-qc-text-secondary mb-1">文章标题</span>
            <input type="text" value={cfg.title}
              onChange={e => update({ title: e.target.value })}
              placeholder="你的内容标题" className="notion-input w-full text-sm" />
          </div>
          <div>
            <span className="block text-[11px] text-qc-text-secondary mb-1">期刊名称</span>
            <input type="text" value={cfg.journalName}
              onChange={e => update({ journalName: e.target.value })}
              placeholder="QUIET JOURNAL" className="notion-input w-full text-sm" />
          </div>
          <div>
            <span className="block text-[11px] text-qc-text-secondary mb-1">期刊标语</span>
            <input type="text" value={cfg.journalTagline}
              onChange={e => update({ journalTagline: e.target.value })}
              placeholder="THE NOTES" className="notion-input w-full text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="block text-[11px] text-qc-text-secondary mb-1">期号</span>
              <input type="text" value={cfg.issueNumber}
                onChange={e => update({ issueNumber: e.target.value })}
                placeholder="42" className="notion-input w-full text-sm" />
            </div>
            <div>
              <span className="block text-[11px] text-qc-text-secondary mb-1">发布日期</span>
              <input type="date" value={cfg.publishDate}
                onChange={e => update({ publishDate: e.target.value })}
                className="notion-input w-full text-sm" />
            </div>
          </div>
          <div>
            <span className="block text-[11px] text-qc-text-secondary mb-1">作者（可选）</span>
            <input type="text" value={journalConfig.author || ''}
              onChange={e => dispatch({ type: 'SET_JOURNAL_CONFIG', payload: { author: e.target.value } })}
              placeholder="你的名字" className="notion-input w-full text-sm" />
          </div>
          <div>
            <span className="block text-[11px] text-qc-text-secondary mb-1">小红书账号（可选）</span>
            <input type="text" value={journalConfig.socialHandle || ''}
              onChange={e => dispatch({ type: 'SET_JOURNAL_CONFIG', payload: { socialHandle: e.target.value } })}
              placeholder="@your_handle" className="notion-input w-full text-sm" />
          </div>
        </div>
      </section>

      {/* 期刊 Logo */}
      <section>
        <label className="block text-xs font-medium text-qc-text-tertiary uppercase tracking-wider mb-2">
          期刊 Logo（可选）
        </label>
        <div className="flex items-center gap-3">
          <div
            onClick={() => logoRef.current?.click()}
            className="w-14 h-14 rounded-lg bg-qc-elevated border border-qc-border-light flex items-center justify-center
                       cursor-pointer hover:border-qc-accent hover:bg-qc-accent-light transition-all overflow-hidden flex-shrink-0"
          >
            {journalConfig.logoUrl
              ? <img src={journalConfig.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-lg" />
              : <span className="text-xl font-bold text-qc-text-tertiary">Q</span>
            }
          </div>
          <div className="flex-1">
            <button onClick={() => logoRef.current?.click()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-qc-text-secondary hover:text-qc-accent hover:bg-qc-accent-light rounded-md transition-colors">
              <Upload size={11} />上传 Logo
            </button>
            <p className="text-[10px] text-qc-text-tertiary mt-1">JPG/PNG，建议 200×200px</p>
            {journalConfig.logoUrl && (
              <button onClick={() => dispatch({ type: 'SET_JOURNAL_CONFIG', payload: { logoUrl: undefined } })}
                className="text-[11px] text-red-400 hover:text-red-600 mt-0.5 transition-colors">移除</button>
            )}
          </div>
        </div>
        <input ref={logoRef} type="file" accept="image/jpeg,image/png,image/jpg" onChange={handleLogo} className="hidden" />
      </section>
    </div>
  );
}
