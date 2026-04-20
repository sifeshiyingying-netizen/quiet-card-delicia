// F051 - 全局状态管理（React Context）
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import {
  EditorState,
  ContentBlock,
  Card,
  CardType,
  StyleType,
  FontConfig,
  ThemeConfig,
  ExportRatio,
  JournalConfig,
  CoverConfig,
  FONT_PRESETS,
  THEME_PRESETS,
  BlockType,
  FontSizeOption,
} from '../types';
import { parseContentBlocks } from '../utils/contentParser';
import { paginateForLongForm, splitBlockAtPosition } from '../utils/paginator';
import { historyManager } from '../utils/historyManager';
import { getTodayString } from '../utils/formatters';
import { debouncedAutoSave, loadFromLocalStorage, saveWithTimestamp } from '../utils/autoSaveManager';

const DEFAULT_JOURNAL: JournalConfig = {
  journalName: 'QUIET JOURNAL',
  journalTagline: 'THE NOTES',
  issueNumber: '',
  publishDate: getTodayString(),
};

// 加载保存的状态或使用默认状态
const loadInitialState = (): EditorState => {
  const savedState = loadFromLocalStorage();
  if (savedState) {
    // 处理可能包含时间戳的对象
    const processedState = { ...savedState };
    delete processedState['_timestamp'];

    return {
      insights: processedState.insights || ['', '', ''],
      fullText: processedState.fullText || '',
      style: processedState.style || 'quiet',
      font: processedState.font || FONT_PRESETS[0],
      theme: processedState.theme || THEME_PRESETS[1], // 温暖驼色
      exportRatio: processedState.exportRatio || '4:3',
      journalConfig: processedState.journalConfig || DEFAULT_JOURNAL,
      coverConfig: processedState.coverConfig,
      contentBlocks: processedState.contentBlocks || [],
      // 保留保存的卡片布局和当前页面，而不是重新生成
      cards: processedState.cards || [],
      currentPage: processedState.currentPage || 0,
      blockTypeOverrides: processedState.blockTypeOverrides || {},
      blockSplits: processedState.blockSplits || {},
      fontSize: processedState.fontSize || 'normal', // 默认字体大小
    };
  }

  return {
    insights: ['', '', ''],
    fullText: '',
    style: 'quiet',
    font: FONT_PRESETS[0],
    theme: THEME_PRESETS[1], // 温暖驼色
    exportRatio: '4:3',
    journalConfig: DEFAULT_JOURNAL,
    coverConfig: undefined,
    contentBlocks: [],
    cards: [],
    currentPage: 0,
    blockTypeOverrides: {},
    blockSplits: {},
    fontSize: 'normal', // 默认字体大小
  };
};

const DEFAULT_STATE: EditorState = loadInitialState();

type Action =
  | { type: 'SET_INSIGHTS'; payload: string[] }
  | { type: 'SET_INSIGHTS_NO_RECOMPUTE'; payload: string[] } // 用于输入时的防抖更新
  | { type: 'SET_FULL_TEXT'; payload: string }
  | { type: 'SET_FULL_TEXT_NO_RECOMPUTE'; payload: string } // 用于输入时的防抖更新
  | { type: 'SET_STYLE'; payload: StyleType }
  | { type: 'SET_FONT'; payload: FontConfig }
  | { type: 'SET_THEME'; payload: ThemeConfig }
  | { type: 'SET_EXPORT_RATIO'; payload: ExportRatio }
  | { type: 'SET_JOURNAL_CONFIG'; payload: Partial<JournalConfig> }
  | { type: 'SET_COVER_CONFIG'; payload: CoverConfig | undefined }
  | { type: 'SET_CONTENT_BLOCKS'; payload: ContentBlock[] }
  | { type: 'UPDATE_BLOCK_TYPE'; payload: { id: string; blockType: BlockType } }
  | { type: 'SPLIT_BLOCK'; payload: { blockId: string; position: number } }
  | { type: 'SET_CARDS'; payload: Card[] }
  | { type: 'MOVE_CARD'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'SET_CARD_TYPE'; payload: { cardId: string; cardType: CardType } }
  | { type: 'SET_CURRENT_PAGE'; payload: number }
  | { type: 'SET_FONT_SIZE'; payload: FontSizeOption }
  | { type: 'FORCE_RECOMPUTE' }
  | { type: 'RESTORE_STATE'; payload: EditorState };

/**
 * Apply persisted user overrides after parsing.
 * 1. blockTypeOverrides – manual block-type changes (F009), survive theme/font changes.
 * 2. blockSplits – manual splits (F023), each stored as {originalId → splitPosition}.
 */
function applyUserOverrides(
  parsed: ContentBlock[],
  blockTypeOverrides: Record<string, BlockType>,
  blockSplits: Record<string, number>
): ContentBlock[] {
  // Step 1: apply type overrides
  let blocks = parsed.map(b =>
    blockTypeOverrides[b.id] ? { ...b, type: blockTypeOverrides[b.id] } : b
  );

  // Step 2: apply splits in order of original block IDs so earlier splits don't shift positions
  for (const [blockId, position] of Object.entries(blockSplits)) {
    blocks = splitBlockAtPosition(blocks, blockId, position);
  }

  return blocks;
}

function recompute(state: EditorState): Partial<EditorState> {
  const parsed = parseContentBlocks(state.fullText);
  const contentBlocks = applyUserOverrides(parsed, state.blockTypeOverrides, state.blockSplits);
  const cards = paginateForLongForm(
    state.fullText,
    state.insights.filter(i => i.trim()),
    contentBlocks,
    state.theme,
    state.font,
    state.journalConfig,
    state.exportRatio,
    state.fontSize
  );
  // Clamp currentPage to valid range after recomputation
  const currentPage = Math.min(state.currentPage, Math.max(0, cards.length - 1));
  return { contentBlocks, cards, currentPage };
}

function reducer(state: EditorState, action: Action): EditorState {
  switch (action.type) {
    case 'SET_INSIGHTS': {
      const next = { ...state, insights: action.payload };
      return { ...next, ...recompute(next) };
    }
    case 'SET_INSIGHTS_NO_RECOMPUTE': {
      // 仅更新insights而不触发重新计算（用于输入防抖）
      return { ...state, insights: action.payload };
    }
    case 'SET_FULL_TEXT': {
      const next = { ...state, fullText: action.payload };
      return { ...next, ...recompute(next) };
    }
    case 'SET_FULL_TEXT_NO_RECOMPUTE': {
      // 仅更新fullText而不触发重新计算（用于输入防抖）
      return { ...state, fullText: action.payload };
    }
    case 'SET_STYLE':
      return { ...state, style: action.payload };
    case 'SET_FONT': {
      const next = { ...state, font: action.payload };
      return { ...next, ...recompute(next) };
    }
    case 'SET_THEME': {
      const next = { ...state, theme: action.payload };
      return { ...next, ...recompute(next) };
    }
    case 'SET_EXPORT_RATIO': {
      const next = { ...state, exportRatio: action.payload };
      return { ...next, ...recompute(next) };
    }
    case 'SET_JOURNAL_CONFIG': {
      const next = { ...state, journalConfig: { ...state.journalConfig, ...action.payload } };
      return { ...next, ...recompute(next) };
    }
    case 'SET_COVER_CONFIG':
      return { ...state, coverConfig: action.payload };
    case 'SET_CONTENT_BLOCKS':
      return { ...state, contentBlocks: action.payload };
    case 'UPDATE_BLOCK_TYPE': {
      // F009 - Store override durably so it survives theme/font/config recompute()
      const newOverrides = { ...state.blockTypeOverrides, [action.payload.id]: action.payload.blockType };
      const next = { ...state, blockTypeOverrides: newOverrides };
      return { ...next, ...recompute(next) };
    }
    case 'SPLIT_BLOCK': {
      // F023 - Store split durably so it survives any later recompute()
      const newSplits = { ...state.blockSplits, [action.payload.blockId]: action.payload.position };
      const next = { ...state, blockSplits: newSplits };
      return { ...next, ...recompute(next) };
    }
    case 'SET_CARDS':
      return { ...state, cards: action.payload };
    case 'MOVE_CARD': {
      const cards = [...state.cards];
      const [moved] = cards.splice(action.payload.fromIndex, 1);
      cards.splice(action.payload.toIndex, 0, moved);
      return { ...state, cards: cards.map((c, i) => ({ ...c, pageNumber: i + 1 })) };
    }
    case 'SET_CARD_TYPE':
      return {
        ...state,
        cards: state.cards.map(c =>
          c.id === action.payload.cardId ? { ...c, type: action.payload.cardType } : c
        ),
      };
    case 'SET_CURRENT_PAGE': {
      const max = Math.max(0, state.cards.length - 1);
      return { ...state, currentPage: Math.min(max, Math.max(0, action.payload)) };
    }
    case 'SET_FONT_SIZE':
      return { ...state, fontSize: action.payload };
    case 'FORCE_RECOMPUTE': {
      return { ...state, ...recompute(state) };
    }
    case 'RESTORE_STATE':
      return action.payload;
    default:
      return state;
  }
}

interface AppContextValue {
  state: EditorState;
  dispatch: React.Dispatch<Action>;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE);

  // 自动保存：当状态变化时保存到localStorage（带时间戳）
  useEffect(() => {
    saveWithTimestamp(state);
  }, [state]);

  // 键盘快捷键：Ctrl+Z / Ctrl+Shift+Z (F034)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          const nextState = historyManager.redo(state);
          if (nextState) dispatch({ type: 'RESTORE_STATE', payload: nextState });
        } else {
          const prevState = historyManager.undo(state);
          if (prevState) dispatch({ type: 'RESTORE_STATE', payload: prevState });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state]);

  const undo = useCallback(() => {
    const prevState = historyManager.undo(state);
    if (prevState) dispatch({ type: 'RESTORE_STATE', payload: prevState });
  }, [state]);

  const redo = useCallback(() => {
    const nextState = historyManager.redo(state);
    if (nextState) dispatch({ type: 'RESTORE_STATE', payload: nextState });
  }, [state]);

  return React.createElement(AppContext.Provider, {
    value: {
      state,
      dispatch,
      undo,
      redo,
      canUndo: historyManager.canUndo(),
      canRedo: historyManager.canRedo(),
    },
    children,
  });
}

export function useAppStore() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppStore must be used within AppProvider');
  return ctx;
}

export function useDispatch() {
  return useAppStore().dispatch;
}
