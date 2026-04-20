// F037 - 模板保存/复用 UI 组件
import { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { loadTemplates, deleteTemplate, saveTemplate } from '../../utils/templateManager';
import { BookmarkPlus, Trash2, Check } from 'lucide-react';
import { FONT_PRESETS, THEME_PRESETS } from '../../types';

export function TemplateManager() {
  const { state, dispatch } = useAppStore();
  const [templates, setTemplates] = useState(() => loadTemplates());
  const [saveName, setSaveName] = useState('');
  const [saved, setSaved] = useState(false);

  const refreshTemplates = () => setTemplates(loadTemplates());

  const handleSave = () => {
    const name = saveName.trim() || `模板 ${templates.length + 1}`;
    saveTemplate(name, {
      style: state.style,
      font: state.font,
      theme: state.theme,
      exportRatio: state.exportRatio,
    });
    setSaveName('');
    setSaved(true);
    refreshTemplates();
    setTimeout(() => setSaved(false), 1500);
  };

  const handleDelete = (id: string) => {
    deleteTemplate(id);
    refreshTemplates();
  };

  const applyTemplate = (tpl: ReturnType<typeof loadTemplates>[0]) => {
    const font = FONT_PRESETS.find(f => f.fontId === tpl.font.fontId) || tpl.font;
    const theme = THEME_PRESETS.find(t => t.id === tpl.theme.id) || tpl.theme;
    dispatch({ type: 'SET_STYLE', payload: tpl.style });
    dispatch({ type: 'SET_FONT', payload: font });
    dispatch({ type: 'SET_THEME', payload: theme });
    dispatch({ type: 'SET_EXPORT_RATIO', payload: tpl.exportRatio });
  };

  return (
    <section>
      <label className="block text-xs font-medium text-qc-text-tertiary uppercase tracking-wider mb-3">
        保存当前风格
      </label>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={saveName}
          onChange={e => setSaveName(e.target.value)}
          placeholder="模板名称（可选）"
          className="notion-input flex-1 text-sm"
          onKeyDown={e => e.key === 'Enter' && handleSave()}
        />
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white transition-colors flex-shrink-0"
          style={{ backgroundColor: '#7C8C3E' }}
        >
          {saved ? <Check size={12} /> : <BookmarkPlus size={12} />}
          {saved ? '已保存' : '保存'}
        </button>
      </div>

      {templates.length > 0 ? (
        <div className="space-y-2">
          <div className="text-xs text-qc-text-tertiary mb-2">已保存的模板（{templates.length}）</div>
          {templates.map(tpl => (
            <div
              key={tpl.id}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-qc-border-light bg-qc-elevated hover:border-qc-border-medium transition-all group"
            >
              <div
                className="w-5 h-5 rounded flex-shrink-0"
                style={{ backgroundColor: tpl.theme.paperColor, border: `1.5px solid ${tpl.theme.accentColor}44` }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-qc-text-primary truncate">{tpl.name}</div>
                <div className="text-[10px] text-qc-text-tertiary">{tpl.font.display} · {tpl.theme.name}</div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => applyTemplate(tpl)}
                  className="text-[10px] px-2 py-1 rounded bg-qc-accent-light text-qc-accent hover:bg-qc-accent hover:text-white transition-all"
                >
                  应用
                </button>
                <button
                  onClick={() => handleDelete(tpl.id)}
                  className="p-1 rounded text-qc-text-tertiary hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-qc-text-tertiary py-2 text-center">
          还没有保存的模板
        </div>
      )}
    </section>
  );
}
