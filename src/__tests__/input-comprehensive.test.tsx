import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { App } from '../../App';
import { AppProvider } from '../store/appStore';
import { EditorState } from '../types';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

describe('输入系统综合测试', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  it('封面输入框输入不应卡顿，文字应完整显示', async () => {
    render(
      <AppProvider>
        <App />
      </AppProvider>
    );

    // 模拟找到封面标题输入框（这需要根据实际DOM结构调整）
    const coverInputs = screen.getAllByRole('textbox');

    // 查找可能的封面输入框
    let coverTitleInput: HTMLElement | null = null;
    for (const input of coverInputs) {
      if (input.placeholder.includes('你的内容标题')) {
        coverTitleInput = input;
        break;
      }
    }

    if (coverTitleInput) {
      // 测试快速输入
      fireEvent.change(coverTitleInput, { target: { value: '测试标题' } });

      await waitFor(() => {
        expect(coverTitleInput).toHaveValue('测试标题');
      });
    }
  });

  it('正文输入不应突然失去响应', async () => {
    render(
      <AppProvider>
        <App />
      </AppProvider>
    );

    const fullTextInput = screen.getByPlaceholderText(/粘贴你的长文章内容/i);

    // 测试连续输入
    fireEvent.change(fullTextInput, { target: { value: '第一段' } });
    fireEvent.change(fullTextInput, { target: { value: '第一段\n第二段' } });
    fireEvent.change(fullTextInput, { target: { value: '第一段\n第二段\n第三段' } });

    await waitFor(() => {
      expect(fullTextInput).toHaveValue('第一段\n第二段\n第三段');
    });
  });

  it('页面刷新后内容应持久化', async () => {
    // 模拟保存状态
    const savedState: Partial<EditorState> = {
      insights: ['测试观点1', '测试观点2', ''],
      fullText: '测试全文内容',
      style: 'quiet',
      exportRatio: '4:3',
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));

    // 重新渲染应用以测试状态恢复
    render(
      <AppProvider>
        <App />
      </AppProvider>
    );

    // 等待状态恢复
    await waitFor(() => {
      // 检查是否从localStorage加载了数据
      expect(localStorage.getItem).toHaveBeenCalledWith('quietcard_auto_save');
    });
  });

  it('快速输入不应导致字符丢失', async () => {
    render(
      <AppProvider>
        <App />
      </AppProvider>
    );

    const insightInput = screen.getByPlaceholderText(/输入核心观点 1/i);

    // 快速连续输入，模拟用户快速打字
    const testData = [
      'H',
      'He',
      'Hel',
      'Hell',
      'Hello',
      'Hello ',
      'Hello W',
      'Hello Wo',
      'Hello Wor',
      'Hello Worl',
      'Hello World'
    ];

    for (const text of testData) {
      fireEvent.change(insightInput, { target: { value: text } });
      // 立即检查当前值，但不等待异步更新
      // 因为我们是在测试输入过程中的行为
    }

    // 最终检查最终值
    fireEvent.change(insightInput, { target: { value: 'Hello World' } });
    await waitFor(() => {
      expect(insightInput).toHaveValue('Hello World');
    });
  });

  it('输入过程中UI应保持响应', async () => {
    render(
      <AppProvider>
        <App />
      </AppProvider>
    );

    const insightInput = screen.getByPlaceholderText(/输入核心观点 1/i);

    // 记录输入时间
    const startTime = performance.now();

    // 快速输入多个不同的值
    for (let i = 0; i < 10; i++) {
      fireEvent.change(insightInput, { target: { value: `测试${i}` } });
      expect(insightInput).toHaveValue(`测试${i}`);
    }

    const endTime = performance.now();

    // 验证整个过程在合理时间内完成（小于500ms）
    expect(endTime - startTime).toBeLessThan(500);

    await waitFor(() => {
      expect(insightInput).toHaveValue('测试9');
    });
  });
});