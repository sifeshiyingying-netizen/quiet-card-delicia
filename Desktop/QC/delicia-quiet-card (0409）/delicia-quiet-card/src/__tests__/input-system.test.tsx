import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { App } from '../../App';
import { AppProvider } from '../store/appStore';
import { act } from 'react-dom/test-utils';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

describe('输入系统测试', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  it('核心观点输入框应为受控组件，输入后状态应同步', async () => {
    render(
      <AppProvider>
        <App />
      </AppProvider>
    );

    // 查找第一个核心观点输入框
    const insightInput = screen.getByPlaceholderText(/输入核心观点 1/i);

    // 输入文本
    fireEvent.change(insightInput, { target: { value: '测试观点1' } });

    // 等待状态更新
    await waitFor(() => {
      expect(insightInput).toHaveValue('测试观点1');
    });
  });

  it('全文输入框应为受控组件，大量文本输入不应导致卡顿', async () => {
    render(
      <AppProvider>
        <App />
      </AppProvider>
    );

    const fullTextInput = screen.getByPlaceholderText(/粘贴你的长文章内容/i);

    // 模拟大量文本输入
    const longText = '这是一个很长的测试文本。'.repeat(100);

    // 开始计时
    const startTime = performance.now();
    fireEvent.change(fullTextInput, { target: { value: longText } });
    const endTime = performance.now();

    // 验证输入完成且响应时间合理（小于100ms）
    expect(endTime - startTime).toBeLessThan(100);
    expect(fullTextInput).toHaveValue(longText);
  });

  it('快速连续输入不应丢失字符', async () => {
    render(
      <AppProvider>
        <App />
      </AppProvider>
    );

    const insightInput = screen.getByPlaceholderText(/输入核心观点 1/i);

    // 快速连续输入
    fireEvent.change(insightInput, { target: { value: 'A' } });
    fireEvent.change(insightInput, { target: { value: 'AB' } });
    fireEvent.change(insightInput, { target: { value: 'ABC' } });
    fireEvent.change(insightInput, { target: { value: 'ABCD' } });

    await waitFor(() => {
      expect(insightInput).toHaveValue('ABCD');
    });
  });

  it('输入过程中UI应保持响应，不应出现卡顿', async () => {
    render(
      <AppProvider>
        <App />
      </AppProvider>
    );

    const insightInput = screen.getByPlaceholderText(/输入核心观点 1/i);

    // 进行多次快速输入，测量响应时间
    const inputs = ['测试', '测试A', '测试AB', '测试ABC', '测试ABCD'];

    for (const text of inputs) {
      const startTime = performance.now();
      fireEvent.change(insightInput, { target: { value: text } });
      const endTime = performance.now();

      // 每次输入响应时间应小于50ms
      expect(endTime - startTime).toBeLessThan(50);
    }

    await waitFor(() => {
      expect(insightInput).toHaveValue('测试ABCD');
    });
  });

  it('输入焦点切换时应正确保存状态', async () => {
    render(
      <AppProvider>
        <App />
      </AppProvider>
    );

    const input1 = screen.getByPlaceholderText(/输入核心观点 1/i);
    const input2 = screen.getByPlaceholderText(/输入核心观点 2/i);

    fireEvent.change(input1, { target: { value: '观点1' } });
    fireEvent.focus(input2);
    fireEvent.change(input2, { target: { value: '观点2' } });

    await waitFor(() => {
      expect(input1).toHaveValue('观点1');
      expect(input2).toHaveValue('观点2');
    });
  });

  it('状态更新不应导致UI不同步', async () => {
    render(
      <AppProvider>
        <App />
      </AppProvider>
    );

    const insightInput = screen.getByPlaceholderText(/输入核心观点 1/i);

    // 连续更新状态
    fireEvent.change(insightInput, { target: { value: '初始值' } });
    await waitFor(() => expect(insightInput).toHaveValue('初始值'));

    fireEvent.change(insightInput, { target: { value: '更新值1' } });
    await waitFor(() => expect(insightInput).toHaveValue('更新值1'));

    fireEvent.change(insightInput, { target: { value: '更新值2' } });
    await waitFor(() => expect(insightInput).toHaveValue('更新值2'));
  });
});