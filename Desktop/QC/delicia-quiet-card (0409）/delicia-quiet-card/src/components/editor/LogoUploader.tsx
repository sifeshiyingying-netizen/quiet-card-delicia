// F035 - Logo 上传组件
import { useRef } from 'react';
import { useAppStore } from '../../store/appStore';
import { Upload } from 'lucide-react';

export function LogoUploader() {
  const { state, dispatch } = useAppStore();
  const { journalConfig } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      dispatch({
        type: 'SET_JOURNAL_CONFIG',
        payload: { logoUrl: url },
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <section>
      <label className="block text-xs font-medium text-qc-text-tertiary uppercase tracking-wider mb-3">
        期刊 Logo（可选）
      </label>
      <div className="flex items-center gap-4">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-16 h-16 rounded-lg bg-qc-elevated border border-qc-border-light flex items-center justify-center cursor-pointer
                     hover:border-qc-accent hover:bg-qc-accent-light transition-all overflow-hidden"
        >
          {journalConfig.logoUrl ? (
            <img src={journalConfig.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-lg" />
          ) : (
            <span className="text-2xl font-bold text-qc-text-tertiary">Q</span>
          )}
        </div>
        <div className="flex-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-qc-text-secondary
                       hover:text-qc-accent hover:bg-qc-accent-light rounded-md transition-colors"
          >
            <Upload size={12} />
            上传 Logo
          </button>
          <p className="text-xs text-qc-text-tertiary mt-1">支持 JPG/PNG，建议 200×200px</p>
          {journalConfig.logoUrl && (
            <button
              onClick={() => dispatch({ type: 'SET_JOURNAL_CONFIG', payload: { logoUrl: undefined } })}
              className="text-xs text-red-400 hover:text-red-600 mt-1 transition-colors"
            >
              移除
            </button>
          )}
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        onChange={handleUpload}
        className="hidden"
      />
    </section>
  );
}
