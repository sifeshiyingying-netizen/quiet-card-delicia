// F040 - 输入参数接口
export interface EditorInput {
  coreInsights: string[];
  fullText: string;
  style: StyleType;
  font: FontConfig;
  theme: ThemeConfig;
  exportRatio: ExportRatio;
}

// F040 - 风格类型
export type StyleType = 'quiet' | 'editorial' | 'soft' | 'dual-column';

// F040 - 导出比例
export type ExportRatio = '4:3' | '15:9' | '1:1';

// F040 - 字体配置
export interface FontConfig {
  fontId: string;
  chinese: string;
  english: string;
  display: string;
  license: 'safe';
}

// F040 - 主题配置
export interface ThemeConfig {
  id: string;
  name: string;
  paperColor: string;
  texture: 'none' | 'fine' | 'coarse';
  accentColor: string;
}

// F041 - 内容块类型
export type BlockType = 'H1' | 'H2' | 'P';

export interface ContentBlock {
  id: string;
  type: BlockType;
  text: string;
  pageNumber: number;
}

// F042 - 卡片类型
export enum CardType {
  COVER = 'cover_card',
  GUIDE = 'guide_card',
  BODY = 'body_card',
  SUMMARY = 'summary_card',
  CTA = 'cta_card',
}

export interface CardStyle {
  background: string;
  padding: string;
  fontSize: string;
  lineHeight: number;
  letterSpacing: string;
  textAlign: 'left' | 'center' | 'right';
}

export interface CardLayout {
  width: number;
  height: number;
  maxChars: number;
  maxLines: number;
}

export interface Card {
  id: string;
  type: CardType;
  pageNumber: number;
  blocks: ContentBlock[];
  style: CardStyle;
  layout: CardLayout;
}

// F043 - 期刊配置
export interface JournalConfig {
  logoUrl?: string;
  journalName: string;
  journalTagline: string;
  issueNumber: string;
  publishDate: string;
  author?: string;
  socialHandle?: string;
}

// F044 / F055 - 封面配置
export enum CoverTemplate {
  MAGAZINE = 'magazine',
  POSTER = 'poster',
  MINIMAL = 'minimal',
  PHOTO_BOTTOM = 'photo_bottom',
  PHOTO_MIDDLE = 'photo_middle',
  PHOTO_FULL = 'photo_full',
  PHOTO_TOP_FILL = 'photo_top_fill',
}

export interface CoverColorScheme {
  id: string;
  name: string;
  background: string;
  text: string;
  accent: string;
  photoOverlay?: string;
  photoFilter?: string;
}

export interface CoverConfig {
  template: CoverTemplate;
  colorScheme: string;
  uploadedImage?: string;
  title: string;
  journalName: string;
  journalTagline: string;
  issueNumber: string;
  publishDate: string;
  /** 自定义封面配色（colorScheme === 'custom' 时生效） */
  customScheme?: {
    background: string;
    text: string;
    accent: string;
  };
}

// F029 - 封面配色方案预设数据
export const COVER_COLOR_SCHEMES: CoverColorScheme[] = [
  {
    id: 'warm',
    name: '经典米白',
    background: '#F5F1E8',
    text: '#2D2520',
    accent: '#9E7B4A',
    photoOverlay: 'rgba(0,0,0,0.15)',
  },
  {
    id: 'cool',
    name: '艺术蓝灰',
    background: '#3D5467',
    text: '#F0EDE8',
    accent: '#C8A96E',
    photoOverlay: 'rgba(30,50,70,0.5)',
    photoFilter: 'grayscale(30%)',
  },
  {
    id: 'minimal',
    name: '纯白极简',
    background: '#FFFFFF',
    text: '#1A1A1A',
    accent: '#555555',
  },
  {
    id: 'vintage',
    name: '复古泛黄',
    background: '#EAE0C8',
    text: '#3D2B1F',
    accent: '#8B4513',
    photoOverlay: 'rgba(80,40,0,0.3)',
    photoFilter: 'sepia(60%) contrast(90%)',
  },
  {
    id: 'modern',
    name: '现代黑白',
    background: '#111111',
    text: '#F0F0F0',
    accent: '#FFFFFF',
    photoOverlay: 'rgba(0,0,0,0.45)',
    photoFilter: 'grayscale(100%) contrast(110%)',
  },
];

// 预设字体组合
export const FONT_PRESETS: FontConfig[] = [
  {
    fontId: 'classic',
    display: '经典杂志',
    chinese: 'Noto Serif SC',
    english: 'Playfair Display',
    license: 'safe',
  },
  {
    fontId: 'modern',
    display: '现代极简',
    chinese: 'Noto Sans SC',
    english: 'Inter',
    license: 'safe',
  },
  {
    fontId: 'artistic',
    display: '文艺海报',
    chinese: 'Noto Serif SC',
    english: 'Dancing Script',
    license: 'safe',
  },
];

// 预设主题配色 (8种)
export const THEME_PRESETS: ThemeConfig[] = [
  { id: 'classic-cream', name: '经典米白', paperColor: '#F5F5F0', texture: 'none', accentColor: '#7F8F2E' },
  { id: 'warm-camel', name: '温暖驼色', paperColor: '#E9E1D2', texture: 'fine', accentColor: '#A63A3A' },
  { id: 'cool-gray', name: '清冷灰调', paperColor: '#E8E8E8', texture: 'none', accentColor: '#2C3E50' },
  { id: 'light-teal', name: '淡青纸感', paperColor: '#E3E8E3', texture: 'fine', accentColor: '#5D4E37' },
  { id: 'warm-apricot', name: '暖柔杏色', paperColor: '#FFF8F0', texture: 'coarse', accentColor: '#FF8C69' },
  { id: 'deep-gray', name: '深沉墨灰', paperColor: '#D4D4D4', texture: 'none', accentColor: '#C9A227' },
  { id: 'twilight-blue', name: '薄暮蓝调', paperColor: '#EEF2F5', texture: 'fine', accentColor: '#4A6FA5' },
  { id: 'luxe-beige', name: '轻奢米黄', paperColor: '#F7F3E8', texture: 'coarse', accentColor: '#4A5D4A' },
];

// 历史记录条目 (F034)
export interface HistoryEntry {
  timestamp: number;
  label: string;
  state: EditorState;
}

// 全局编辑器状态
export type FontSizeOption = 'small' | 'normal' | 'large';

export interface EditorState {
  insights: string[];
  fullText: string;
  style: StyleType;
  font: FontConfig;
  theme: ThemeConfig;
  exportRatio: ExportRatio;
  journalConfig: JournalConfig;
  coverConfig?: CoverConfig;
  contentBlocks: ContentBlock[];
  cards: Card[];
  currentPage: number;
  /** F009 - 用户手动修改的块类型覆盖，key 为 blockId */
  blockTypeOverrides: Record<string, BlockType>;
  /** F023 - 用户手动分割的块记录，key 为原始 blockId，value 为分割字符位置 */
  blockSplits: Record<string, number>;
  /** F063 - 字体大小选项 */
  fontSize: FontSizeOption;
}
