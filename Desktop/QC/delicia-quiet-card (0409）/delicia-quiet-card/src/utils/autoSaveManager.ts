// 自动保存管理器
import { EditorState } from '../types';

const AUTO_SAVE_KEY = 'quietcard_auto_save';
const DEBOUNCE_DELAY = 1000; // 1秒防抖延迟

let saveTimeout: NodeJS.Timeout | null = null;

/**
 * 保存当前编辑器状态到localStorage
 */
export function saveToLocalStorage(state: EditorState): void {
  try {
    // 保存完整的状态，包括cards和currentPage，以保留用户的排版和布局
    const stateToSave = {
      insights: state.insights,
      fullText: state.fullText,
      style: state.style,
      font: state.font,
      theme: state.theme,
      exportRatio: state.exportRatio,
      journalConfig: state.journalConfig,
      coverConfig: state.coverConfig,
      contentBlocks: state.contentBlocks,
      cards: state.cards, // 保存卡片布局
      currentPage: state.currentPage, // 保存当前页面
      blockTypeOverrides: state.blockTypeOverrides,
      blockSplits: state.blockSplits,
    };

    localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(stateToSave));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

/**
 * 从localStorage加载编辑器状态
 */
export function loadFromLocalStorage(): Partial<EditorState> | null {
  try {
    const saved = localStorage.getItem(AUTO_SAVE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
}

/**
 * 清除自动保存的数据
 */
export function clearAutoSave(): void {
  try {
    localStorage.removeItem(AUTO_SAVE_KEY);
  } catch (error) {
    console.error('Failed to clear auto save:', error);
  }
}

/**
 * 带防抖的自动保存函数
 */
export function debouncedAutoSave(state: EditorState): void {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(() => {
    saveToLocalStorage(state);
  }, DEBOUNCE_DELAY);
}

/**
 * 立即保存（不带防抖）
 */
export function immediateSave(state: EditorState): void {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }
  saveToLocalStorage(state);
}

/**
 * 获取保存状态的时间戳
 */
export function getSaveTimestamp(): number | null {
  try {
    const saved = localStorage.getItem(AUTO_SAVE_KEY);
    if (saved) {
      // 在数据中添加时间戳信息
      const parsed = JSON.parse(saved);
      return parsed._timestamp || null;
    }
    return null;
  } catch (error) {
    console.error('Failed to get save timestamp:', error);
    return null;
  }
}

/**
 * 保存带时间戳的状态
 */
export function saveWithTimestamp(state: EditorState): void {
  try {
    const stateToSave = {
      ...state,
      _timestamp: Date.now(), // 添加时间戳
    };

    localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(stateToSave));
  } catch (error) {
    console.error('Failed to save state with timestamp:', error);
  }
}