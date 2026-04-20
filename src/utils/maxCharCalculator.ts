// F047 - 最大字符数计算
// 基于实际渲染尺寸（RENDER_WIDTH=360px，与手机预览一致），精确估算每页可容纳字符数

// 与 ExportRenderZone 保持同步：RENDER_WIDTH = 360px
const RENDER_WIDTH = 360;

// BodyCard 固定开销（px）：pt-8(32) + pb-6(24) + header+mb-6(33) + footer-mt-4(20)
const BODY_OVERHEAD_PX = 109;

// qc-p 样式：font-size:13px, line-height:1.85, margin-bottom:8px（最后一行无）
const FONT_SIZE = 13;
const LINE_HEIGHT = 1.85;
const PARA_MARGIN = 8; // 每段末尾额外间距
const LINE_HEIGHT_PX = FONT_SIZE * LINE_HEIGHT; // ≈ 24.05px
const EFFECTIVE_LINE_PX = LINE_HEIGHT_PX + PARA_MARGIN / 3; // 含段间距摊算 ≈ 26.7px

// 水平内边距 px-10 = 40px*2，内容宽度 = 360 - 80 = 280px
const CONTENT_WIDTH = RENDER_WIDTH - 80;
// 13px 中文字符宽度约等于 font-size
export const CHARS_PER_LINE = Math.floor(CONTENT_WIDTH / FONT_SIZE); // ≈ 21

// 安全余量（预留标题额外占高、段落首行缩进误差等）
// 0.90 = 用满约90%的行高空间；剩余10%缓冲段落间距和字宽波动
const SAFETY = 0.90;

import { FontSizeOption } from '../types';

interface StyleConfig {
  fontSize?: number;
  lineHeight?: number;
  ratio?: '4:3' | '15:9' | '1:1';
  fontScale?: FontSizeOption;
}

/**
 * F047 - 计算单页正文最大字符数（基于360px渲染宽度）
 */
export function calculateMaxCharsPerPage(style: StyleConfig = {}): number {
  const ratio = style.ratio || '4:3';
  const fontScale = style.fontScale || 'normal';

  // Define font scale factors
  const fontScaleFactors = {
    small: 0.85,  // Smaller font, more content fits
    normal: 1.0,  // Normal size
    large: 1.2    // Larger font, less content fits
  };

  // Calculate effective character metrics based on font scale
  const scaledFontSize = FONT_SIZE * fontScaleFactors[fontScale];
  const scaledLineHeightPx = scaledFontSize * LINE_HEIGHT;
  const scaledEffectiveLinePx = scaledLineHeightPx + PARA_MARGIN / 3;
  const scaledCharsPerLine = Math.floor(CONTENT_WIDTH / scaledFontSize);

  // 360px 渲染高度（与 ExportRenderZone 计算方式一致）
  let renderHeight = RENDER_WIDTH * (4 / 3);  // 4:3 → 480px
  if (ratio === '15:9') renderHeight = RENDER_WIDTH * (15 / 9);  // 15:9 → 600px
  if (ratio === '1:1') renderHeight = RENDER_WIDTH;               // 1:1 → 360px

  const availableHeight = renderHeight - BODY_OVERHEAD_PX;
  const lines = Math.floor(availableHeight / scaledEffectiveLinePx);
  return Math.floor(lines * scaledCharsPerLine * SAFETY);
}

/**
 * 估算一段文字需要的行数（按实际内容宽度）
 */
export function estimateLines(text: string, charsPerLine = CHARS_PER_LINE): number {
  return Math.ceil(text.length / charsPerLine);
}
