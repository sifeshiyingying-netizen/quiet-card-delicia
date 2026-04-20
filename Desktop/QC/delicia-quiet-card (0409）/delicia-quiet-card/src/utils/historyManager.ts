// F034 - 撤销/重做功能：50步历史记录
import { EditorState, HistoryEntry } from '../types';

const MAX_HISTORY = 50;

export class HistoryManager {
  private past: HistoryEntry[] = [];
  private future: HistoryEntry[] = [];

  push(label: string, state: EditorState): void {
    this.past.push({ timestamp: Date.now(), label, state });
    if (this.past.length > MAX_HISTORY) {
      this.past.shift();
    }
    this.future = []; // 新操作清空 redo 历史
  }

  undo(currentState: EditorState): EditorState | null {
    if (this.past.length === 0) return null;

    const entry = this.past.pop()!;
    this.future.unshift({ timestamp: Date.now(), label: 'redo point', state: currentState });

    return entry.state;
  }

  redo(currentState: EditorState): EditorState | null {
    if (this.future.length === 0) return null;

    const entry = this.future.shift()!;
    this.past.push({ timestamp: Date.now(), label: 'undo point', state: currentState });

    return entry.state;
  }

  canUndo(): boolean {
    return this.past.length > 0;
  }

  canRedo(): boolean {
    return this.future.length > 0;
  }

  getHistory(): HistoryEntry[] {
    return [...this.past];
  }

  clear(): void {
    this.past = [];
    this.future = [];
  }
}

export const historyManager = new HistoryManager();
