import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { App } from '../../App';
import { AppProvider } from '../store/appStore';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

describe('输入性能测试', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  it('输入防抖机制应有效降低重新计算频率', async () => {
    render(
      <AppProvider>
        <App />
      </AppProvider>
    );

    const fullTextInput = screen.getByPlaceholderText(/粘贴你的长文章内容/i);

    // 监控性能
    const start = performance.now();

    // 快速连续输入多个字符，应该触发防抖机制
    fireEvent.change(fullTextInput, { target: { value: 'A' } });
    fireEvent.change(fullTextInput, { target: { value: 'AB' } });
    fireEvent.change(fullTextInput, { target: { value: 'ABC' } });
    fireEvent.change(fullTextInput, { target: { value: 'ABCD' } });
    fireEvent.change(fullTextInput, { target: { value: 'ABCDE' } });

    const end = performance.now();

    // 验证输入完成且响应迅速
    await waitFor(() => {
      expect(fullTextInput).toHaveValue('ABCDE');
    });

    // 总时间应在合理范围内
    expect(end - start).toBeLessThan(100);
  });

  it('长时间输入不应导致卡顿', async () => {
    render(
      <AppProvider>
        <App />
      </AppProvider>
    );

    const insightInput = screen.getByPlaceholderText(/输入核心观点 1/i);

    // 模拟用户持续输入
    const text = '这是一个测试文本，用于验证长时间输入是否会卡顿。'.repeat(20);

    // 测试输入过程中的响应性
    const chunkSize = 10;
    for (let i = 0; i < text.length; i += chunkSize) {
      const chunk = text.substring(0, i + chunkSize);
      fireEvent.change(insightInput, { target: { value: chunk } });

      // 确保每次输入都及时响应
      expect(insightInput).toHaveValue(chunk);
    }

    await waitFor(() => {
      expect(insightInput).toHaveValue(text);
    });
  });

  it('状态同步应准确，无字符丢失', async () => {
    render(
      <AppProvider>
        <App />
      </AppProvider>
    );

    const insightInput = screen.getByPlaceholderText(/输入核心观点 1/i);

    // 快速输入复杂文本序列
    const sequence = [
      'A',
      'AB',
      'ABC',
      'ABCD',
      'Hello',
      'Hello World',
      'Hello World!',
      'Hello, 世界!',
      'Hello, 世界! 🌍',
    ];

    for (const text of sequence) {
      fireEvent.change(insightInput, { target: { value: text } });
      // 立即验证当前值
      expect(insightInput).toHaveValue(text);
    }

    await waitFor(() => {
      expect(insightInput).toHaveValue('Hello, 世界! 🌍');
    });
  });

  it('多输入框同时操作应保持独立性和同步性', async () => {
    render(
      <AppProvider>
        <App />
      </AppProvider>
    );

    const input1 = screen.getByPlaceholderText(/输入核心观点 1/i);
    const input2 = screen.getByPlaceholderText(/输入核心观点 2/i);
    const input3 = screen.getByPlaceholderText(/输入核心观点 3/i);

    // 并行更新多个输入框
    fireEvent.change(input1, { target: { value: '观点1' } });
    fireEvent.change(input2, { target: { value: '观点2' } });
    fireEvent.change(input3, { target: { value: '观点3' } });

    await waitFor(() => {
      expect(input1).toHaveValue('观点1');
      expect(input2).toHaveValue('观点2');
      expect(input3).toHaveValue('观点3');
    });

    // 混合更新
    fireEvent.change(input1, { target: { value: '更新观点1' } });
    fireEvent.change(input3, { target: { value: '更新观点3' } });

    await waitFor(() => {
      expect(input1).toHaveValue('更新观点1');
      expect(input2).toHaveValue('观点2');
      expect(input3).toHaveValue('更新观点3');
    });
  });

  it('自动保存功能应正常工作', async () => {
    render(
      <AppProvider>
        <App />
      </AppProvider>
    );

    const insightInput = screen.getByPlaceholderText(/输入核心观点 1/i);

    // 输入内容
    fireEvent.change(insightInput, { target: { value: '测试自动保存' } });

    // 等待防抖保存
    await waitFor(() => {
      // 验证localStorage被调用
      expect(localStorage.setItem).toHaveBeenCalled();
    }, { timeout: 2000 });
  });
});