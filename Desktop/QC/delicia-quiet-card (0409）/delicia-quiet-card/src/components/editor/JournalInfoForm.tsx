// F026 - 期刊信息表单（侧边栏版本）
import { useAppStore } from '../../store/appStore';

export function JournalInfoForm() {
  const { state, dispatch } = useAppStore();
  const { journalConfig } = state;

  const update = (field: string, value: string) => {
    dispatch({ type: 'SET_JOURNAL_CONFIG', payload: { [field]: value } });
  };

  return (
    <section>
      <label className="block text-xs font-medium text-qc-text-tertiary uppercase tracking-wider mb-3">
        期刊信息
      </label>
      <div className="space-y-2.5">
        <div>
          <span className="block text-xs text-qc-text-secondary mb-1">期刊名称</span>
          <input
            type="text"
            value={journalConfig.journalName}
            onChange={e => update('journalName', e.target.value)}
            placeholder="QUIET JOURNAL"
            className="notion-input w-full text-sm"
          />
        </div>
        <div>
          <span className="block text-xs text-qc-text-secondary mb-1">期刊标语</span>
          <input
            type="text"
            value={journalConfig.journalTagline}
            onChange={e => update('journalTagline', e.target.value)}
            placeholder="THE NOTES"
            className="notion-input w-full text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="block text-xs text-qc-text-secondary mb-1">期号</span>
            <input
              type="text"
              value={journalConfig.issueNumber}
              onChange={e => update('issueNumber', e.target.value)}
              placeholder="42"
              className="notion-input w-full text-sm"
            />
          </div>
          <div>
            <span className="block text-xs text-qc-text-secondary mb-1">发布日期</span>
            <input
              type="date"
              value={journalConfig.publishDate}
              onChange={e => update('publishDate', e.target.value)}
              className="notion-input w-full text-sm"
            />
          </div>
        </div>
        <div>
          <span className="block text-xs text-qc-text-secondary mb-1">作者（可选）</span>
          <input
            type="text"
            value={journalConfig.author || ''}
            onChange={e => update('author', e.target.value)}
            placeholder="你的名字"
            className="notion-input w-full text-sm"
          />
        </div>
        <div>
          <span className="block text-xs text-qc-text-secondary mb-1">小红书账号（可选）</span>
          <input
            type="text"
            value={journalConfig.socialHandle || ''}
            onChange={e => update('socialHandle', e.target.value)}
            placeholder="@your_handle"
            className="notion-input w-full text-sm"
          />
        </div>
      </div>
    </section>
  );
}
