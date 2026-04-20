// F036 - 字体加载优化：预加载 + 检测，确保字体可用

const REQUIRED_FONTS = [
  'Noto Serif SC',
  'Noto Sans SC',
  'Playfair Display',
  'Inter',
  'Dancing Script',
];

class FontLoader {
  private loadedFonts = new Set<string>();

  async loadFont(fontFamily: string): Promise<boolean> {
    if (this.loadedFonts.has(fontFamily)) return true;
    try {
      await document.fonts.load(`16px "${fontFamily}"`);
      const ok = document.fonts.check(`16px "${fontFamily}"`);
      if (ok) this.loadedFonts.add(fontFamily);
      return ok;
    } catch {
      return false;
    }
  }

  async loadAllFonts(fonts: string[] = REQUIRED_FONTS): Promise<void> {
    await Promise.allSettled(fonts.map(font => this.loadFont(font)));
  }

  isLoaded(fontFamily: string): boolean {
    return this.loadedFonts.has(fontFamily);
  }
}

export const fontLoader = new FontLoader();

/**
 * 初始化时预加载所有字体
 */
export async function initFonts(): Promise<void> {
  try {
    await fontLoader.loadAllFonts();
  } catch {
    // 字体加载失败不阻断应用
  }
}
