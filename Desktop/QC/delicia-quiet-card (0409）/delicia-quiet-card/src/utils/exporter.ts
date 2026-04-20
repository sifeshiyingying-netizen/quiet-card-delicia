// F031 - 单张导出 + F032 批量导出
import html2canvas from 'html2canvas';
import JSZip from 'jszip';

/**
 * F031 - 单张卡片导出为 PNG Blob
 *
 * ExportRenderZone 现在以 360px 宽渲染（与手机预览一致），
 * scale:3 放大到 1080px，确保字体/排版与预览完全匹配。
 */
export async function exportCard(
  element: HTMLElement,
  quality = 0.95
): Promise<Blob> {
  const canvas = await html2canvas(element, {
    scale: 3,           // 3× → 360px × 3 = 1080px 输出宽度
    useCORS: true,      // 允许跨域图片
    backgroundColor: null,
    logging: false,
    imageTimeout: 0,    // 等待图片加载
    allowTaint: false,
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error('导出失败')),
      'image/png',
      quality
    );
  });
}

/**
 * 下载 Blob 文件
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * F032 - 批量导出所有卡片，打包为 ZIP
 */
export async function exportAllCards(
  cardIds: string[],
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder('quietcard-export')!;

  for (let i = 0; i < cardIds.length; i++) {
    const element = document.getElementById(cardIds[i]);
    if (!element) {
      console.warn(`未找到卡片元素：${cardIds[i]}`);
      onProgress?.(i + 1, cardIds.length);
      continue;
    }

    try {
      const blob = await exportCard(element);
      folder.file(`card_${String(i + 1).padStart(2, '0')}.png`, blob);
    } catch (err) {
      console.error(`导出卡片 ${cardIds[i]} 失败:`, err);
    }

    onProgress?.(i + 1, cardIds.length);
    // 短暂让出主线程，避免浏览器卡顿
    await new Promise(resolve => setTimeout(resolve, 80));
  }

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  downloadBlob(zipBlob, `quietcard-${Date.now()}.zip`);
}
