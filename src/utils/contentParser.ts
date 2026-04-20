// F008 / F048 - 内容块自动识别 + 标题识别规则
import { BlockType, ContentBlock } from '../types';

/**
 * Deterministic, stable block ID derived from line index + first 32 chars of content.
 * This is critical for F009/F023: blockTypeOverrides and blockSplits are keyed by ID,
 * so IDs must remain the same across recomputes for the same input text.
 */
function stableId(lineIndex: number, text: string): string {
  const slug = text.trim().slice(0, 32).replace(/\s+/g, '_').replace(/[^\w_]/g, '');
  return `block_${lineIndex}_${slug}`;
}

/**
 * F008 - 自动识别 H1/H2/P 三级分类
 * H1: 中文序号开头（一、二、三...十）
 * H2: 数字序号（1.1, 2.3）或 Markdown 标题（##）
 * P: 其他所有文本
 */
export function detectBlockType(line: string): BlockType {
  const trimmed = line.trim();

  // F048 - 一级标题：中文序号开头
  if (/^[一二三四五六七八九十百千]+[、.]/.test(trimmed)) {
    return 'H1';
  }
  // 一级标题：Markdown # 标题
  if (/^#\s/.test(trimmed)) {
    return 'H1';
  }

  // F048 - 二级标题：数字序号（1.1, 2.3 等）或 Markdown ##
  if (/^\d+\.\d+/.test(trimmed) || /^##\s/.test(trimmed)) {
    return 'H2';
  }

  // 其他 → 正文
  return 'P';
}

/**
 * F008 - 解析全文为内容块列表
 */
export function parseContentBlocks(fullText: string): ContentBlock[] {
  if (!fullText.trim()) return [];

  const lines = fullText.split('\n').filter(l => l.trim());
  return lines.map((line, idx) => ({
    id: stableId(idx, line),
    type: detectBlockType(line),
    text: line.trim(),
    pageNumber: 0,
  }));
}

/**
 * 重新解析但保留用户手动修改的类型
 */
export function reparseWithOverrides(
  fullText: string,
  overrides: Record<string, BlockType>
): ContentBlock[] {
  const blocks = parseContentBlocks(fullText);
  return blocks.map(block => ({
    ...block,
    type: overrides[block.id] || block.type,
  }));
}
