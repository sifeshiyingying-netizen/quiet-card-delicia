// F010 / F011 / F012 - 字体/风格/主题配色选择器
import { useState, useRef } from 'react';
import { useAppStore } from '../../store/appStore';
import { FONT_PRESETS, THEME_PRESETS, StyleType, FontConfig, ThemeConfig } from '../../types';
import { historyManager } from '../../utils/historyManager';
import { FontSizeSelector } from './FontSizeSelector';

const CUSTOM_THEME_ID = 'custom';

function isValidHex(v: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(v);
}

function ColorPickerRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  const [inputVal, setInputVal] = useState(value);
  const colorRef = useRef<HTMLInputElement>(null);

  const handleText = (v: string) => {
    setInputVal(v);
    if (isValidHex(v)) onChange(v);
  };

  const handleNative = (v: string) => {
    setInputVal(v);
    onChange(v);
  };

  return (
    <div className="flex items-center gap-2 py-1.5">
      <button
        type="button"
        onClick={() => colorRef.current?.click()}
        className="w-6 h-6 rounded border border-qc-border-medium flex-shrink-0 cursor-pointer shadow-sm"
        style={{ backgroundColor: isValidHex(inputVal) ? inputVal : value }}
        title="点击选色"
      />
      <input
        ref={colorRef}
        type="color"
        value={isValidHex(inputVal) ? inputVal : value}
        onChange={e => handleNative(e.target.value)}
        className="sr-only"
        tabIndex={-1}
      />
      <span className="text-[11px] text-qc-text-tertiary w-14 flex-shrink-0">{label}</span>
      <input
        type="text"
        value={inputVal}
        onChange={e => handleText(e.target.value)}
        maxLength={7}
        placeholder="#RRGGBB"
        className={`flex-1 text-[11px] font-mono px-2 py-1 rounded border outline-none transition-colors ${
          isValidHex(inputVal)
            ? 'border-qc-border-light bg-white text-qc-text-primary'
            : 'border-red-300 bg-red-50 text-red-600'
        }`}
      />
    </div>
  );
}

export function StyleSelector() {
  const { state, dispatch } = useAppStore();
  const { style, font, theme } = state;

  const [customPaper, setCustomPaper] = useState(theme.paperColor ?? '#F5F5F0');
  const [customAccent, setCustomAccent] = useState(theme.accentColor ?? '#7C8C3E');

  const buildCustomTheme = (paper: string, accent: string): ThemeConfig => ({
    id: CUSTOM_THEME_ID,
    name: '自定义',
    paperColor: paper,
    texture: 'none',
    accentColor: accent,
  });

  const setStyle = (s: StyleType) => {
    historyManager.push(`切换风格: ${s}`, state);
    dispatch({ type: 'SET_STYLE', payload: s });
  };

  const setFont = (f: FontConfig) => {
    historyManager.push(`切换字体: ${f.display}`, state);
    dispatch({ type: 'SET_FONT', payload: f });
  };

  const setTheme = (t: ThemeConfig) => {
    historyManager.push(`切换主题: ${t.name}`, state);
    dispatch({ type: 'SET_THEME', payload: t });
  };

  const applyCustom = (paper: string, accent: string) => {
    dispatch({ type: 'SET_THEME', payload: buildCustomTheme(paper, accent) });
  };

  const handleCustomPaper = (hex: string) => {
    setCustomPaper(hex);
    applyCustom(hex, customAccent);
  };

  const handleCustomAccent = (hex: string) => {
    setCustomAccent(hex);
    applyCustom(customPaper, hex);
  };

  const selectCustom = () => {
    historyManager.push('切换主题: 自定义', state);
    applyCustom(customPaper, customAccent);
  };

  const STYLE_OPTIONS = [
    { id: 'quiet' as const, name: 'Quiet', desc: '静谧纸质感' },
    { id: 'editorial' as const, name: 'Editorial', desc: '杂志风格' },
    { id: 'soft' as const, name: 'Soft', desc: '暖色调' },
    { id: 'dual-column' as const, name: 'Dual Column', desc: '双栏排版' },
  ];

  const isCustomActive = theme.id === CUSTOM_THEME_ID;

  return (
    <div className="space-y-5">
      {/* 排版风格 */}
      <section>
        <label className="block text-xs font-medium text-qc-text-tertiary uppercase tracking-wider mb-3">
          排版风格
        </label>
        <div className="grid grid-cols-3 gap-2">
          {STYLE_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => setStyle(opt.id)}
              className={`px-3 py-2.5 rounded-lg border text-center transition-all ${
                style === opt.id
                  ? 'border-qc-accent bg-qc-accent-light text-qc-accent'
                  : 'border-qc-border-light hover:border-qc-border-medium text-qc-text-secondary'
              }`}
            >
              <div className="text-xs font-semibold">{opt.name}</div>
              <div className="text-[10px] mt-0.5 opacity-70">{opt.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* 字体组合 */}
      <section>
        <label className="block text-xs font-medium text-qc-text-tertiary uppercase tracking-wider mb-3">
          字体组合
        </label>
        <div className="space-y-2">
          {FONT_PRESETS.map(f => (
            <button
              key={f.fontId}
              onClick={() => setFont(f)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${
                font.fontId === f.fontId
                  ? 'border-qc-accent bg-qc-accent-light'
                  : 'border-qc-border-light hover:border-qc-border-medium'
              }`}
            >
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                font.fontId === f.fontId ? 'bg-qc-accent' : 'bg-qc-border-medium'
              }`} />
              <div className="text-left">
                <div className={`text-xs font-medium ${
                  font.fontId === f.fontId ? 'text-qc-accent' : 'text-qc-text-primary'
                }`}>{f.display}</div>
                <div className="text-[10px] text-qc-text-tertiary">{f.chinese} + {f.english}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 主题配色 */}
      <section>
        <label className="block text-xs font-medium text-qc-text-tertiary uppercase tracking-wider mb-3">
          主题配色
        </label>
        <div className="grid grid-cols-2 gap-2">
          {THEME_PRESETS.map(t => (
            <button
              key={t.id}
              onClick={() => setTheme(t)}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg border transition-all ${
                theme.id === t.id
                  ? 'border-qc-accent bg-qc-accent-light'
                  : 'border-qc-border-light hover:border-qc-border-medium'
              }`}
            >
              <div
                className="w-6 h-6 rounded border border-qc-border-light flex-shrink-0"
                style={{ backgroundColor: t.paperColor }}
              />
              <div className="text-left flex-1 min-w-0">
                <div className={`text-[11px] font-medium truncate ${
                  theme.id === t.id ? 'text-qc-accent' : 'text-qc-text-primary'
                }`}>{t.name}</div>
                <div className="w-full h-0.5 rounded mt-1" style={{ backgroundColor: t.accentColor }} />
              </div>
            </button>
          ))}

          {/* 自定义配色 */}
          <button
            onClick={selectCustom}
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg border transition-all ${
              isCustomActive
                ? 'border-qc-accent bg-qc-accent-light'
                : 'border-qc-border-light hover:border-qc-border-medium border-dashed'
            }`}
          >
            <div
              className="w-6 h-6 rounded border border-qc-border-light flex-shrink-0 flex items-center justify-center overflow-hidden"
              style={isCustomActive ? { backgroundColor: customPaper } : {}}
            >
              {!isCustomActive && (
                <span className="text-[13px] text-qc-text-tertiary leading-none">＋</span>
              )}
            </div>
            <div className="text-left flex-1 min-w-0">
              <div className={`text-[11px] font-medium truncate ${
                isCustomActive ? 'text-qc-accent' : 'text-qc-text-tertiary'
              }`}>自定义</div>
              {isCustomActive
                ? <div className="w-full h-0.5 rounded mt-1" style={{ backgroundColor: customAccent }} />
                : <div className="text-[10px] text-qc-text-tertiary opacity-60">自设色号</div>
              }
            </div>
          </button>
        </div>

        {/* 自定义色号输入面板 */}
        {isCustomActive && (
          <div className="mt-3 px-3 py-2.5 rounded-lg border border-qc-accent/30 bg-qc-accent-light/40 space-y-0.5">
            <p className="text-[10px] text-qc-text-tertiary mb-2 tracking-wide uppercase">自定义色号</p>
            <ColorPickerRow label="纸张底色" value={customPaper} onChange={handleCustomPaper} />
            <ColorPickerRow label="强调色" value={customAccent} onChange={handleCustomAccent} />
          </div>
        )}
      </section>

      {/* 字体大小 */}
      <FontSizeSelector />
    </div>
  );
}
