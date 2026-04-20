// F017 - 卡片呼吸感排版：H1/H2/P 层级样式，40px 内边距，1.8 行高
import {
  Card, CardType, ContentBlock, JournalConfig, FontConfig, ThemeConfig,
  CoverConfig, CoverTemplate, COVER_COLOR_SCHEMES, StyleType
} from '../../types';
import { getTextureStyle } from '../../utils/textureGenerator';
import { formatPublishDate } from '../../utils/formatters';

/** 解析封面配色（含自定义方案） */
function resolveScheme(coverConfig?: CoverConfig) {
  if (!coverConfig?.colorScheme) return null;
  if (coverConfig.colorScheme === 'custom' && coverConfig.customScheme) {
    return {
      id: 'custom',
      name: '自定义',
      background: coverConfig.customScheme.background,
      text: coverConfig.customScheme.text,
      accent: coverConfig.customScheme.accent,
      photoOverlay: undefined as string | undefined,
      photoFilter: undefined as string | undefined,
    };
  }
  return COVER_COLOR_SCHEMES.find(s => s.id === coverConfig.colorScheme) || null;
}

interface CardLayoutProps {
  card: Card;
  journalConfig: JournalConfig;
  font: FontConfig;
  theme: ThemeConfig;
  logoUrl?: string;
  coverConfig?: CoverConfig;
  id?: string;
  layoutStyle?: StyleType;
  fontSize?: 'small' | 'normal' | 'large';
}

function BlockRenderer({ block, font, fontSize = 'normal' }: { block: ContentBlock; font: FontConfig; fontSize?: 'small' | 'normal' | 'large' }) {
  const fontClass = font.fontId === 'modern' ? 'font-sans-cn' : 'font-serif-cn';

  if (block.type === 'H1') {
    return <h1 className={`qc-h1 ${fontClass} size-${fontSize}`}>{block.text}</h1>;
  }
  if (block.type === 'H2') {
    return <h2 className={`qc-h2 ${fontClass} size-${fontSize}`}>{block.text}</h2>;
  }
  return <p className={`qc-p ${fontClass} size-${fontSize}`}>{block.text}</p>;
}

// ─── Cover Card (F025-F030) ───────────────────────────────────────────────────

function CoverCardMagazine({
  card, journalConfig, font, theme, logoUrl, coverConfig
}: CardLayoutProps) {
  const scheme = resolveScheme(coverConfig);
  const bg = scheme ? scheme.background : theme.paperColor;
  const textColor = scheme ? scheme.text : '#37352F';
  const accentColor = scheme ? scheme.accent : theme.accentColor;
  const photoFilter = scheme?.photoFilter;

  const title = coverConfig?.title || card.blocks[0]?.text || journalConfig.journalName;
  const journalName = coverConfig?.journalName || journalConfig.journalName;
  const journalTagline = coverConfig?.journalTagline || journalConfig.journalTagline;
  const issueNumber = coverConfig?.issueNumber || journalConfig.issueNumber;
  const publishDate = coverConfig?.publishDate || journalConfig.publishDate;

  const fontMagazine = font.fontId === 'artistic' ? 'font-handwriting' : 'font-magazine';
  const fontCn = font.fontId === 'modern' ? 'font-sans-cn' : 'font-serif-cn';
  const textureStyle = getTextureStyle(theme.texture);

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden"
      style={{ backgroundColor: bg }}>
      {theme.texture !== 'none' && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: textureStyle, opacity: 0.5 }} />
      )}
      <div className="relative z-10 flex flex-col h-full p-10">
        {/* Logo + 期刊名 */}
        {(logoUrl || journalName) && (
          <div className="flex items-center gap-3 mb-6">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: accentColor + '22' }}>
                <span className="font-bold text-base" style={{ color: accentColor }}>Q</span>
              </div>
            )}
            <div>
              {journalName && (
                <div className={`text-xs font-semibold tracking-[0.25em] uppercase ${fontMagazine}`}
                  style={{ color: accentColor }}>
                  {journalName}
                </div>
              )}
              {journalTagline && (
                <div className="text-[10px] tracking-widest uppercase"
                  style={{ color: textColor, opacity: 0.55 }}>
                  {journalTagline}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 封面图片 */}
        {coverConfig?.uploadedImage && (
          <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-6 shadow-lg">
            <img
              src={coverConfig.uploadedImage}
              alt="封面"
              className="w-full h-full object-cover"
              style={{ filter: photoFilter }}
            />
          </div>
        )}

        {/* 标题区 */}
        <div className="flex-1 flex flex-col justify-center">
          {title && (
            <h1 className={`text-2xl font-bold leading-[1.35] tracking-tight mb-3 ${fontCn}`}
              style={{ color: textColor }}>
              {title}
            </h1>
          )}
        </div>

        {/* 底部：期号 + 日期 */}
        {(issueNumber || publishDate) && (
          <div className="pt-4 border-t" style={{ borderColor: accentColor + '33' }}>
            <div className="flex items-center justify-between">
              {issueNumber && (
                <div className="text-xs font-medium tracking-widest font-modern opacity-60"
                  style={{ color: textColor }}>
                  {issueNumber}
                </div>
              )}
              {publishDate && (
                <div className="text-xs font-modern opacity-60" style={{ color: textColor }}>
                  {formatPublishDate(publishDate)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CoverCardPoster({
  card, journalConfig, font, theme, logoUrl, coverConfig
}: CardLayoutProps) {
  const scheme = resolveScheme(coverConfig);
  const bg = scheme ? scheme.background : theme.paperColor;
  const textColor = scheme ? scheme.text : '#37352F';
  const accentColor = scheme ? scheme.accent : theme.accentColor;
  const photoFilter = scheme?.photoFilter;
  const photoOverlay = scheme?.photoOverlay;

  const title = coverConfig?.title || card.blocks[0]?.text || journalConfig.journalName;
  const journalName = coverConfig?.journalName || journalConfig.journalName;
  const issueNumber = coverConfig?.issueNumber || journalConfig.issueNumber;
  const publishDate = coverConfig?.publishDate || journalConfig.publishDate;

  const fontHandwriting = font.fontId === 'artistic' ? 'font-handwriting' : 'font-magazine';
  const fontCn = font.fontId === 'modern' ? 'font-sans-cn' : 'font-serif-cn';

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden"
      style={{ backgroundColor: bg }}>
      {/* 全版背景图 */}
      {coverConfig?.uploadedImage && (
        <div className="absolute inset-0">
          <img
            src={coverConfig.uploadedImage}
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: photoFilter }}
          />
          {photoOverlay && (
            <div className="absolute inset-0" style={{ backgroundColor: photoOverlay }} />
          )}
        </div>
      )}

      <div className="relative z-10 flex flex-col h-full justify-between p-10">
        {/* 顶部期刊名 */}
        {(logoUrl || journalName) && (
          <div>
            {logoUrl && (
              <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded-full object-cover mb-2" />
            )}
            {journalName && (
              <div className={`text-xs font-semibold tracking-[0.35em] uppercase font-magazine`}
                style={{ color: coverConfig?.uploadedImage ? '#FFFFFF' : textColor, opacity: 0.8 }}>
                {journalName}
              </div>
            )}
          </div>
        )}

        {/* 底部大标题 */}
        <div>
          {title && (
            <h1 className={`text-3xl font-bold leading-[1.25] mb-6 ${fontCn}`}
              style={{ color: coverConfig?.uploadedImage ? '#FFFFFF' : textColor }}>
              {title}
            </h1>
          )}
          {(issueNumber || publishDate) && (
            <div className="flex items-center justify-between">
              {issueNumber && (
                <span className={`text-[10px] tracking-[0.3em] uppercase ${fontHandwriting}`}
                  style={{ color: accentColor }}>
                  {issueNumber}
                </span>
              )}
              {publishDate && (
                <span className="text-[10px] font-modern"
                  style={{ color: coverConfig?.uploadedImage ? 'rgba(255,255,255,0.6)' : textColor, opacity: 0.6 }}>
                  {formatPublishDate(publishDate)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CoverCardMinimal({
  card, journalConfig, font, theme, logoUrl, coverConfig
}: CardLayoutProps) {
  const scheme = resolveScheme(coverConfig);
  const bg = scheme ? scheme.background : '#FFFFFF';
  const textColor = scheme ? scheme.text : '#1A1A1A';
  const accentColor = scheme ? scheme.accent : theme.accentColor;

  const title = coverConfig?.title || card.blocks[0]?.text || journalConfig.journalName;
  const journalName = coverConfig?.journalName || journalConfig.journalName;
  const journalTagline = coverConfig?.journalTagline || journalConfig.journalTagline;
  const issueNumber = coverConfig?.issueNumber || journalConfig.issueNumber;
  const publishDate = coverConfig?.publishDate || journalConfig.publishDate;

  const fontMagazine = font.fontId === 'artistic' ? 'font-handwriting' : 'font-magazine';
  const fontCn = font.fontId === 'modern' ? 'font-sans-cn' : 'font-serif-cn';

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative"
      style={{ backgroundColor: bg }}>
      <div className="w-full px-10 text-center">
        {/* 顶部装饰线 */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex-1 h-px" style={{ backgroundColor: accentColor, opacity: 0.3 }} />
          {(logoUrl || journalName) && (
            <>
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-7 h-7 rounded-full" />
              ) : (
                <div className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: accentColor + '20' }}>
                  <span className="text-xs font-bold" style={{ color: accentColor }}>Q</span>
                </div>
              )}
            </>
          )}
          <div className="flex-1 h-px" style={{ backgroundColor: accentColor, opacity: 0.3 }} />
        </div>

        {/* 期刊名 */}
        {journalName && (
          <div className={`text-[10px] font-semibold tracking-[0.5em] uppercase mb-6 ${fontMagazine}`}
            style={{ color: accentColor }}>
            {journalName}
          </div>
        )}

        {/* 主标题 */}
        {title && (
          <h1 className={`text-2xl font-bold leading-[1.35] mb-6 ${fontCn}`}
            style={{ color: textColor }}>
            {title}
          </h1>
        )}

        {/* 分隔线 */}
        {(journalTagline || issueNumber || publishDate) && (
          <>
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-8 h-px" style={{ backgroundColor: accentColor }} />
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
              <div className="w-8 h-px" style={{ backgroundColor: accentColor }} />
            </div>

            {/* 标语 + 期号日期 */}
            {journalTagline && (
              <div className={`text-[10px] tracking-widest uppercase opacity-50 mb-1 font-modern`}
                style={{ color: textColor }}>
                {journalTagline}
              </div>
            )}
            {(issueNumber || publishDate) && (
              <div className="text-[10px] font-modern opacity-40" style={{ color: textColor }}>
                {issueNumber}{issueNumber ? ' · ' : ''}{formatPublishDate(publishDate)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// F055 - 照片下方版式（标题居上，照片占下方60%）—— 参考图1风格
function CoverCardPhotoBottom({
  card, journalConfig, font, theme, logoUrl, coverConfig
}: CardLayoutProps) {
  const scheme = resolveScheme(coverConfig);
  const bg = scheme ? scheme.background : theme.paperColor;
  const textColor = scheme ? scheme.text : '#37352F';
  const accentColor = scheme ? scheme.accent : theme.accentColor;
  const photoFilter = scheme?.photoFilter;

  const title = coverConfig?.title || card.blocks[0]?.text || journalConfig.journalName;
  const journalName = coverConfig?.journalName || journalConfig.journalName;
  const issueNumber = coverConfig?.issueNumber || journalConfig.issueNumber;
  const publishDate = coverConfig?.publishDate || journalConfig.publishDate;

  const fontMagazine = font.fontId === 'artistic' ? 'font-handwriting' : 'font-magazine';
  const fontCn = font.fontId === 'modern' ? 'font-sans-cn' : 'font-serif-cn';

  const issueLabel = issueNumber;

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden"
      style={{ backgroundColor: bg }}>
      {/* 上方文字区（40%） */}
      <div className="flex-shrink-0 p-10 pb-6 flex flex-col">
        {/* 期号 + Logo行 */}
        {(issueLabel || logoUrl) && (
          <div className="flex items-center justify-between mb-4">
            {issueLabel && (
              <span className={`text-xs tracking-[0.25em] uppercase ${fontMagazine} opacity-50`}
                style={{ color: textColor }}>{issueLabel}</span>
            )}
            {logoUrl && (
              <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded-full object-cover" />
            )}
          </div>
        )}

        {/* 大标题 */}
        {title && (
          <h1 className={`text-3xl font-bold leading-[1.25] mb-3 ${fontCn}`}
            style={{ color: textColor }}>
            {title}
          </h1>
        )}

        {/* 期刊名 + 日期 */}
        {(journalName || publishDate) && (
          <div className="flex items-end justify-between mt-auto pt-2">
            {journalName && (
              <span className={`text-[10px] tracking-[0.3em] uppercase font-semibold ${fontMagazine}`}
                style={{ color: accentColor }}>
                {journalName}
              </span>
            )}
            {publishDate && (
              <span className="text-[10px] font-modern opacity-50" style={{ color: textColor }}>
                {formatPublishDate(publishDate)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 下方照片区（60%），无照片时显示占位 */}
      <div className="flex-1 relative overflow-hidden">
        {coverConfig?.uploadedImage ? (
          <img
            src={coverConfig.uploadedImage}
            alt="封面照片"
            className="w-full h-full object-cover"
            style={{ filter: photoFilter }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2"
            style={{ backgroundColor: accentColor + '15' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: accentColor + '30' }}>
              <span className="text-lg" style={{ color: accentColor }}>↑</span>
            </div>
            <span className="text-xs tracking-widest uppercase font-magazine opacity-50"
              style={{ color: textColor }}>上传照片</span>
          </div>
        )}
      </div>
    </div>
  );
}

// F055 - 照片中部版式（三栏报头 + 照片居中）—— 参考图2风格
function CoverCardPhotoMiddle({
  card, journalConfig, font, theme, logoUrl, coverConfig
}: CardLayoutProps) {
  const scheme = resolveScheme(coverConfig);
  const bg = scheme ? scheme.background : theme.paperColor;
  const textColor = scheme ? scheme.text : '#37352F';
  const accentColor = scheme ? scheme.accent : theme.accentColor;
  const photoFilter = scheme?.photoFilter;

  const title = coverConfig?.title || card.blocks[0]?.text || journalConfig.journalName;
  const journalName = coverConfig?.journalName || journalConfig.journalName;
  const journalTagline = coverConfig?.journalTagline || journalConfig.journalTagline;
  const issueNumber = coverConfig?.issueNumber || journalConfig.issueNumber;
  const publishDate = coverConfig?.publishDate || journalConfig.publishDate;

  const fontMagazine = font.fontId === 'artistic' ? 'font-handwriting' : 'font-magazine';
  const fontCn = font.fontId === 'modern' ? 'font-sans-cn' : 'font-serif-cn';

  const issueLabel = issueNumber;

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden"
      style={{ backgroundColor: bg }}>
      <div className="relative z-10 flex flex-col h-full">
        {/* 三栏报头 */}
        <div className="flex items-center justify-between px-10 py-5 border-b"
          style={{ borderColor: textColor + '22' }}>
          <span className={`text-[9px] tracking-[0.3em] uppercase opacity-60 ${fontMagazine}`}
            style={{ color: textColor }}>{journalTagline}</span>
          <span className={`text-sm font-bold tracking-[0.25em] uppercase ${fontMagazine}`}
            style={{ color: textColor }}>{journalName}</span>
          <span className={`text-[9px] tracking-[0.3em] uppercase opacity-60 ${fontMagazine}`}
            style={{ color: textColor }}>
            {issueLabel || formatPublishDate(publishDate)}
          </span>
        </div>

        {/* 标题区 */}
        <div className="px-10 pt-6 pb-4 text-center">
          <h1 className={`text-2xl font-bold leading-[1.25] mb-2 ${fontCn}`}
            style={{ color: textColor }}>
            "{title}"
          </h1>
          {logoUrl && (
            <img src={logoUrl} alt="Logo" className="w-6 h-6 rounded-full mx-auto mt-2" />
          )}
        </div>

        {/* 中部照片 */}
        <div className="flex-1 mx-10 mb-10 relative overflow-hidden rounded-lg">
          {coverConfig?.uploadedImage ? (
            <img
              src={coverConfig.uploadedImage}
              alt="封面照片"
              className="w-full h-full object-cover"
              style={{ filter: photoFilter }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg"
              style={{ borderColor: accentColor + '40', backgroundColor: accentColor + '08' }}>
              <span className="text-sm opacity-40" style={{ color: textColor }}>↑ 上传照片</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// F055 - 照片全屏版式（全出血照片 + 底部文字叠加）
function CoverCardPhotoFull({
  card, journalConfig, font, theme, logoUrl, coverConfig
}: CardLayoutProps) {
  const scheme = resolveScheme(coverConfig);
  const bg = scheme ? scheme.background : '#1A1A1A';
  const textColor = coverConfig?.uploadedImage ? '#FFFFFF' : (scheme ? scheme.text : '#FFFFFF');
  const accentColor = scheme ? scheme.accent : theme.accentColor;
  const photoFilter = scheme?.photoFilter;
  const photoOverlay = scheme?.photoOverlay || 'rgba(0,0,0,0.35)';

  const title = coverConfig?.title || card.blocks[0]?.text || journalConfig.journalName;
  const journalName = coverConfig?.journalName || journalConfig.journalName;
  const issueNumber = coverConfig?.issueNumber || journalConfig.issueNumber;
  const publishDate = coverConfig?.publishDate || journalConfig.publishDate;

  const fontMagazine = font.fontId === 'artistic' ? 'font-handwriting' : 'font-magazine';
  const fontCn = font.fontId === 'modern' ? 'font-sans-cn' : 'font-serif-cn';

  const issueLabel = issueNumber;

  return (
    <div className="w-full h-full relative overflow-hidden"
      style={{ backgroundColor: bg }}>
      {/* 全屏照片 */}
      {coverConfig?.uploadedImage ? (
        <>
          <img
            src={coverConfig.uploadedImage}
            alt="封面照片"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: photoFilter }}
          />
          <div className="absolute inset-0" style={{ backgroundColor: photoOverlay }} />
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: accentColor + '15' }}>
          <span className="text-xs tracking-widest uppercase font-magazine opacity-40"
            style={{ color: bg === '#1A1A1A' ? '#FFF' : '#000' }}>上传全屏照片</span>
        </div>
      )}

      {/* 顶部 Logo + 期刊名 */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-8">
        {logoUrl ? (
          <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded-full object-cover" />
        ) : <span />}
        <span className={`text-[10px] tracking-[0.35em] uppercase ${fontMagazine}`}
          style={{ color: textColor, opacity: 0.8 }}>
          {journalName}
        </span>
      </div>

      {/* 底部文字叠加 */}
      <div className="absolute bottom-0 left-0 right-0 p-10">
        <h1 className={`text-3xl font-bold leading-[1.2] mb-4 ${fontCn}`}
          style={{ color: textColor }}>
          {title}
        </h1>
        <div className="flex items-center justify-between">
          {issueLabel ? (
            <span className={`text-[10px] tracking-[0.3em] uppercase ${fontMagazine}`}
              style={{ color: accentColor }}>
              {issueLabel}
            </span>
          ) : <span />}
          <span className="text-[10px] font-modern" style={{ color: textColor, opacity: 0.6 }}>
            {formatPublishDate(publishDate)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Cover Card with Top Image Fill ──────────────────────────────────────────────

function CoverCardTopImageFill({
  card, journalConfig, font, theme, logoUrl, coverConfig
}: CardLayoutProps) {
  const scheme = resolveScheme(coverConfig);
  const bg = scheme ? scheme.background : theme.paperColor;
  const textColor = scheme ? scheme.text : '#37352F';
  const accentColor = scheme ? scheme.accent : theme.accentColor;
  const photoFilter = scheme?.photoFilter;

  const title = coverConfig?.title || card.blocks[0]?.text || journalConfig.journalName;
  const journalName = coverConfig?.journalName || journalConfig.journalName;
  const issueNumber = coverConfig?.issueNumber || journalConfig.issueNumber;
  const publishDate = coverConfig?.publishDate || journalConfig.publishDate;

  const fontMagazine = font.fontId === 'artistic' ? 'font-handwriting' : 'font-magazine';
  const fontCn = font.fontId === 'modern' ? 'font-sans-cn' : 'font-serif-cn';

  const issueLabel = issueNumber;

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden"
      style={{ backgroundColor: bg }}>

      {/* Upper half: Image that fills the space */}
      <div className="flex-1 relative overflow-hidden">
        {coverConfig?.uploadedImage ? (
          <img
            src={coverConfig.uploadedImage}
            alt="封面照片"
            className="w-full h-full object-cover"
            style={{ filter: photoFilter }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2"
            style={{ backgroundColor: accentColor + '15' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: accentColor + '30' }}>
              <span className="text-xs" style={{ color: accentColor }}>+</span>
            </div>
            <span className="text-xs opacity-50" style={{ color: textColor }}>上传照片</span>
          </div>
        )}

        {/* Overlay for journal info at top */}
        <div className="absolute top-0 left-0 right-0 p-6" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 100%)' }}>
          <div className="flex justify-between items-start">
            <div>
              {issueLabel && (
                <span className={`text-xs tracking-[0.25em] uppercase ${fontMagazine} opacity-80`}
                  style={{ color: '#FFFFFF' }}>{issueLabel}</span>
              )}
              {journalName && (
                <div className="mt-1">
                  <span className={`text-[10px] tracking-[0.3em] uppercase font-semibold ${fontMagazine} block`}
                    style={{ color: '#FFFFFF' }}>
                    {journalName}
                  </span>
                </div>
              )}
            </div>
            {logoUrl && (
              <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded-full object-cover" style={{ border: '2px solid rgba(255,255,255,0.3)' }} />
            )}
          </div>
        </div>
      </div>

      {/* Bottom area for title and additional info */}
      <div className="p-6 flex flex-col justify-center" style={{ minHeight: '40%' }}>
        {title && (
          <h1 className={`text-2xl font-bold leading-[1.3] mb-3 text-center ${fontCn}`}
            style={{ color: textColor }}>
            {title}
          </h1>
        )}

        {(publishDate) && (
          <div className="text-center">
            <span className="text-[11px] font-modern opacity-70" style={{ color: textColor }}>
              {formatPublishDate(publishDate)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// 根据 coverConfig.template 选择封面布局
function CoverCard(props: CardLayoutProps) {
  const template = props.coverConfig?.template || CoverTemplate.MAGAZINE;
  switch (template) {
    case CoverTemplate.POSTER:
      return <CoverCardPoster {...props} />;
    case CoverTemplate.MINIMAL:
      return <CoverCardMinimal {...props} />;
    case CoverTemplate.PHOTO_BOTTOM:
      return <CoverCardPhotoBottom {...props} />;
    case CoverTemplate.PHOTO_MIDDLE:
      return <CoverCardPhotoMiddle {...props} />;
    case CoverTemplate.PHOTO_FULL:
      return <CoverCardPhotoFull {...props} />;
    case CoverTemplate.PHOTO_TOP_FILL:
      return <CoverCardTopImageFill {...props} />;
    case CoverTemplate.MAGAZINE:
    default:
      return <CoverCardMagazine {...props} />;
  }
}

// ─── Guide Card ───────────────────────────────────────────────────────────────

function GuideCard({ card, journalConfig, font, theme, logoUrl }: CardLayoutProps) {
  const textureStyle = getTextureStyle(theme.texture);
  const fontCnClass = font.fontId === 'modern' ? 'font-sans-cn' : 'font-serif-cn';
  const fontMagazineClass = font.fontId === 'artistic' ? 'font-handwriting' : 'font-magazine';

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden"
      style={{ backgroundColor: theme.paperColor }}>
      {theme.texture !== 'none' && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: textureStyle, opacity: 0.5 }} />
      )}
      <div className="relative z-10 flex flex-col h-full p-10">
        {(logoUrl || journalConfig.journalName) && (
          <div className="flex items-center gap-2 mb-8">
            {logoUrl && (
              <img src={logoUrl} alt="Logo" className="w-7 h-7 rounded-full object-cover" />
            )}
            {!logoUrl && journalConfig.journalName && (
              <div className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ backgroundColor: theme.accentColor + '22' }}>
                <span className="text-xs font-bold" style={{ color: theme.accentColor }}>Q</span>
              </div>
            )}
            {journalConfig.journalName && (
              <span className={`text-[10px] font-medium tracking-[0.25em] uppercase ${fontMagazineClass} opacity-60`}
                style={{ color: '#37352F' }}>
                {journalConfig.journalName}
              </span>
            )}
          </div>
        )}

        {card.blocks.length > 0 && (
          <div className={`text-xs font-medium tracking-[0.3em] uppercase mb-6 ${fontMagazineClass}`}
            style={{ color: theme.accentColor }}>
            CONTENTS · 本期导读
          </div>
        )}

        <div className="flex-1 space-y-4">
          {card.blocks.map((block, idx) => (
            <div key={block.id} className="flex items-start gap-4">
              <span className="text-xs font-medium font-modern mt-0.5 opacity-50 flex-shrink-0 w-5 text-center"
                style={{ color: theme.accentColor }}>
                {idx + 1}
              </span>
              <p className={`text-sm leading-[1.7] ${fontCnClass}`}
                style={{ color: '#37352F', letterSpacing: '0.02em' }}>
                {block.text.replace(/^\d+\.\s*/, '')}
              </p>
            </div>
          ))}
        </div>

        {(journalConfig.issueNumber || journalConfig.publishDate) && (
          <div className="pt-4 border-t flex justify-between items-center"
            style={{ borderColor: theme.accentColor + '33' }}>
            <span className="text-[10px] font-modern opacity-40 uppercase tracking-wider">
              {journalConfig.issueNumber} · {formatPublishDate(journalConfig.publishDate)}
            </span>
            <span className="text-[10px] font-modern opacity-40">P.2</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Body Card ────────────────────────────────────────────────────────────────

function BodyCard({ card, journalConfig, font, theme, layoutStyle, fontSize }: CardLayoutProps) {
  const textureStyle = getTextureStyle(theme.texture);
  const fontMagazineClass = font.fontId === 'artistic' ? 'font-handwriting' : 'font-magazine';
  const style = layoutStyle ?? 'quiet';
  const sizeClass = fontSize ? `size-${fontSize}` : 'size-normal';

  // ── Editorial ──────────────────────────────────────────────────────────────
  if (style === 'editorial') {
    return (
      <div className="w-full h-full flex flex-row relative overflow-hidden"
        style={{ backgroundColor: theme.paperColor }}>
        {theme.texture !== 'none' && (
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: textureStyle, opacity: 0.4 }} />
        )}
        {/* 左侧竖向色条 */}
        <div className="flex-shrink-0 w-[5px] h-full" style={{ backgroundColor: theme.accentColor }} />
        <div className="relative z-10 flex flex-col flex-1 pl-5 pr-8 pt-0 pb-0 overflow-hidden">
          {/* 顶部 header 色块 */}
          {(journalConfig.journalName || card.pageNumber) && (
            <div className="flex items-stretch mb-4 mt-0 -mr-8">
              <div className="flex-1 flex items-center justify-between px-4 py-2.5"
                style={{ backgroundColor: theme.accentColor + '18', borderBottom: `1.5px solid ${theme.accentColor}` }}>
                {journalConfig.journalName && (
                  <span className={`text-[9px] font-bold tracking-[0.25em] uppercase ${fontMagazineClass}`}
                    style={{ color: theme.accentColor }}>
                    {journalConfig.journalName}
                  </span>
                )}
                {card.pageNumber && (
                  <span className="text-[9px] font-bold tracking-wider font-magazine"
                    style={{ color: theme.accentColor }}>
                    {String(card.pageNumber).padStart(2, '0')}
                  </span>
                )}
              </div>
            </div>
          )}
          {/* 内容 */}
          <div className="flex-1 overflow-hidden">
            <div className={`qc-card-content-editorial h-full ${sizeClass}`}>
              {card.blocks.map(block => (
                <BlockRendererEditorial key={block.id} block={block} font={font} theme={theme} fontSize={fontSize} />
              ))}
            </div>
          </div>
          {/* 底部页码色块 */}
          {(journalConfig.journalTagline || card.pageNumber) && (
            <div className="flex justify-end pt-2 pb-3 -mr-8 pr-8">
              <div className="flex items-center gap-1.5">
                <div className="h-px w-12" style={{ backgroundColor: theme.accentColor + '60' }} />
                {journalConfig.journalTagline && (
                  <span className={`text-[8px] font-bold uppercase tracking-wider ${fontMagazineClass}`}
                    style={{ color: theme.accentColor + '80' }}>
                    {journalConfig.journalTagline}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Soft ───────────────────────────────────────────────────────────────────
  if (style === 'soft') {
    return (
      <div className="w-full h-full flex flex-col relative overflow-hidden"
        style={{ backgroundColor: theme.paperColor }}>
        {theme.texture !== 'none' && (
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: textureStyle, opacity: 0.45 }} />
        )}
        <div className="relative z-10 flex flex-col h-full px-9 pt-6 pb-5">
          {/* 居中 header */}
          {(journalConfig.journalName || card.pageNumber) && (
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-4 h-px" style={{ backgroundColor: theme.accentColor + '60' }} />
              {journalConfig.journalName && (
                <span className={`text-[8px] font-medium tracking-[0.22em] uppercase ${fontMagazineClass}`}
                  style={{ color: theme.accentColor }}>
                  {journalConfig.journalName}
                </span>
              )}
              <div className="w-4 h-px" style={{ backgroundColor: theme.accentColor + '60' }} />
            </div>
          )}
          {/* 软分隔线 + 圆点页码 */}
          {card.pageNumber && (
            <div className="flex items-center justify-center gap-1.5 mb-5">
              <div className="w-6 h-px" style={{ backgroundColor: theme.accentColor + '30' }} />
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: theme.accentColor + '50' }} />
              <span className="text-[8px] tracking-widest" style={{ color: theme.accentColor + '80' }}>
                {String(card.pageNumber).padStart(2, '0')}
              </span>
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: theme.accentColor + '50' }} />
              <div className="w-6 h-px" style={{ backgroundColor: theme.accentColor + '30' }} />
            </div>
          )}
          {/* 内容 */}
          <div className="flex-1 overflow-hidden">
            <div className={`qc-card-content-soft h-full ${sizeClass}`}>
              {card.blocks.map(block => (
                <BlockRendererSoft key={block.id} block={block} font={font} theme={theme} fontSize={fontSize} />
              ))}
            </div>
          </div>
          {/* 底部装饰 */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="w-3 h-px" style={{ backgroundColor: theme.accentColor + '40' }} />
            <div className="w-1.5 h-1.5 rotate-45 border"
              style={{ borderColor: theme.accentColor + '60' }} />
            <div className="w-3 h-px" style={{ backgroundColor: theme.accentColor + '40' }} />
          </div>
        </div>
      </div>
    );
  }

  // ── Quiet (default) ────────────────────────────────────────────────────────
  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden"
      style={{ backgroundColor: theme.paperColor }}>
      {theme.texture !== 'none' && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: textureStyle, opacity: 0.5 }} />
      )}
      <div className="relative z-10 flex flex-col h-full px-10 pt-8 pb-6">
        {(journalConfig.journalName || card.pageNumber) && (
          <div className="flex items-center justify-between mb-6">
            {journalConfig.journalName && (
              <span className={`text-[9px] font-medium tracking-[0.2em] uppercase opacity-40 ${fontMagazineClass}`}
                style={{ color: '#37352F' }}>
                {journalConfig.journalName}
              </span>
            )}
            {card.pageNumber && (
              <span className="text-[9px] font-modern opacity-30" style={{ color: '#37352F' }}>
                P.{card.pageNumber}
              </span>
            )}
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          <div className={`qc-card-content h-full ${sizeClass}`}>
            {card.blocks.map(block => (
              <BlockRenderer key={block.id} block={block} font={font} fontSize={fontSize} />
            ))}
          </div>
        </div>

        {card.blocks.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <div className="w-6 h-[1.5px]" style={{ backgroundColor: theme.accentColor }} />
            <div className="flex-1 h-px" style={{ backgroundColor: '#E8E6E1' }} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Editorial block renderer ─────────────────────────────────────────────────
function BlockRendererEditorial({ block, font, theme, fontSize = 'normal' }: { block: ContentBlock; font: FontConfig; theme: ThemeConfig; fontSize?: 'small' | 'normal' | 'large' }) {
  const fontClass = font.fontId === 'modern' ? 'font-sans-cn' : 'font-serif-cn';
  const fontMag = font.fontId === 'artistic' ? 'font-handwriting' : 'font-magazine';
  if (block.type === 'H1') {
    return (
      <div className="mb-2 mt-3 first:mt-0">
        <div className="flex items-baseline gap-2">
          <span className={`text-[10px] font-bold tracking-wider ${fontMag}`}
            style={{ color: theme.accentColor }}>■</span>
          <h1 className={`text-[15px] font-bold leading-[1.35] ${fontClass} size-${fontSize}`}
            style={{ color: '#1F1E1A', letterSpacing: '-0.01em' }}>
            {block.text}
          </h1>
        </div>
        <div className="mt-1.5 ml-4 h-px" style={{ backgroundColor: theme.accentColor + '40' }} />
      </div>
    );
  }
  if (block.type === 'H2') {
    return (
      <h2 className={`text-[12px] font-semibold leading-[1.4] mb-1 mt-2.5 first:mt-0 uppercase tracking-wider ${fontMag} size-${fontSize}`}
        style={{ color: theme.accentColor }}>
        {block.text}
      </h2>
    );
  }
  return (
    <p className={`text-[12px] leading-[1.8] mb-2 last:mb-0 text-justify ${fontClass} size-${fontSize}`}
      style={{ color: '#3D3B38', letterSpacing: '0.02em' }}>
      {block.text}
    </p>
  );
}

// ─── Soft block renderer ──────────────────────────────────────────────────────
function BlockRendererSoft({ block, font, theme, fontSize = 'normal' }: { block: ContentBlock; font: FontConfig; theme: ThemeConfig; fontSize?: 'small' | 'normal' | 'large' }) {
  const fontClass = font.fontId === 'modern' ? 'font-sans-cn' : 'font-serif-cn';
  const fontMag = font.fontId === 'artistic' ? 'font-handwriting' : 'font-magazine';
  if (block.type === 'H1') {
    return (
      <div className="mb-3 mt-2 first:mt-0 text-center">
        <h1 className={`text-[15px] font-bold leading-[1.4] ${fontClass} size-${fontSize}`}
          style={{ color: '#1F1E1A', letterSpacing: '0.01em' }}>
          {block.text}
        </h1>
        <div className="flex items-center justify-center gap-1.5 mt-1.5">
          <div className="w-6 h-[1px]" style={{ backgroundColor: theme.accentColor + '70' }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.accentColor + '80' }} />
          <div className="w-6 h-[1px]" style={{ backgroundColor: theme.accentColor + '70' }} />
        </div>
      </div>
    );
  }
  if (block.type === 'H2') {
    return (
      <h2 className={`text-[12px] font-semibold leading-[1.5] mb-1.5 mt-2.5 first:mt-0 ${fontMag} size-${fontSize}`}
        style={{ color: theme.accentColor, letterSpacing: '0.05em' }}>
        · {block.text}
      </h2>
    );
  }
  return (
    <p className={`text-[13px] leading-[1.85] mb-2 last:mb-0 text-justify ${fontClass} size-${fontSize}`}
      style={{ color: '#4A4845', letterSpacing: '0.025em' }}>
      {block.text}
    </p>
  );
}

// ─── Dual Column Layout ───────────────────────────────────────────────────────

function DualColumnLayout({ card, journalConfig, font, theme, fontSize = 'normal' }: CardLayoutProps) {
  const textureStyle = getTextureStyle(theme.texture);
  const fontClass = font.fontId === 'modern' ? 'font-sans-cn' : 'font-serif-cn';
  const fontMagazineClass = font.fontId === 'artistic' ? 'font-handwriting' : 'font-magazine';
  const sizeClass = fontSize ? `size-${fontSize}` : 'size-normal';

  // Separate blocks by type for better dual-column layout
  const h1Blocks = card.blocks.filter(b => b.type === 'H1');
  const h2Blocks = card.blocks.filter(b => b.type === 'H2');
  const pBlocks = card.blocks.filter(b => b.type === 'P');

  return (
    <div className="w-full h-full relative overflow-hidden"
      style={{ backgroundColor: theme.paperColor }}>
      {theme.texture !== 'none' && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: textureStyle, opacity: 0.4 }} />
      )}

      {/* Header with journal info */}
      <div className="pt-4 px-4 pb-1">
        {journalConfig.journalName && (
          <div className={`text-[9px] font-bold tracking-[0.3em] uppercase ${fontMagazineClass}`}
            style={{ color: theme.accentColor }}>
            {journalConfig.journalName}
          </div>
        )}
        {(journalConfig.journalTagline || card.pageNumber) && (
          <div className="flex items-center gap-1.5 mt-0.5">
            {journalConfig.journalTagline && (
              <span className="text-[8px] font-medium opacity-70" style={{ color: '#6B6B6B' }}>
                {journalConfig.journalTagline}
              </span>
            )}
            {journalConfig.journalTagline && card.pageNumber && <span className="text-[8px] opacity-30">·</span>}
            {card.pageNumber && (
              <span className="text-[8px] font-modern opacity-30" style={{ color: '#37352F' }}>
                P.{card.pageNumber}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Dual column content area with tighter spacing */}
      <div className="px-4 pb-4 h-[calc(100%-40px)] flex-1 overflow-hidden">
        <div className="grid grid-cols-2 gap-3 h-full">
          {/* Left column */}
          <div className="h-full overflow-y-auto pr-1.5">
            <div className={`qc-card-content h-full ${sizeClass}`}>
              {h1Blocks.map(block => (
                <div key={block.id} className="mb-2 first:mt-0">
                  <h1 className={`qc-h1 ${fontClass} size-${fontSize}`}>{block.text}</h1>
                </div>
              ))}
              {pBlocks.slice(0, Math.ceil(pBlocks.length / 2)).map(block => (
                <div key={block.id} className="mb-1.5 last:mb-0">
                  <p className={`qc-p ${fontClass} size-${fontSize}`}>{block.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="h-full overflow-y-auto pl-1.5 border-l border-qc-border-light" style={{ borderColor: theme.accentColor + '20' }}>
            <div className={`qc-card-content h-full ${sizeClass}`}>
              {h2Blocks.map(block => (
                <div key={block.id} className="mb-1.5 first:mt-0">
                  <h2 className={`qc-h2 ${fontClass} size-${fontSize}`}>{block.text}</h2>
                </div>
              ))}
              {pBlocks.slice(Math.ceil(pBlocks.length / 2)).map(block => (
                <div key={block.id} className="mb-1.5 last:mb-0">
                  <p className={`qc-p ${fontClass} size-${fontSize}`}>{block.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

function SummaryCard({ card, journalConfig, font, theme }: CardLayoutProps) {
  const textureStyle = getTextureStyle(theme.texture);
  const fontCnClass = font.fontId === 'modern' ? 'font-sans-cn' : 'font-serif-cn';
  const fontMagazineClass = font.fontId === 'artistic' ? 'font-handwriting' : 'font-magazine';

  const hasContent = card.blocks.some(b => b.type === 'P' && b.text.trim());

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: theme.paperColor }}>
      {theme.texture !== 'none' && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: textureStyle, opacity: 0.5 }} />
      )}
      <div className="relative z-10 w-full px-10">
        {hasContent && (
          <div className={`text-xs font-medium tracking-[0.3em] uppercase text-center mb-8 ${fontMagazineClass}`}
            style={{ color: theme.accentColor }}>
            KEY TAKEAWAYS · 核心要点
          </div>
        )}

        <div className="space-y-5">
          {card.blocks.filter(b => b.type === 'P').map(block => (
            <div key={block.id} className="flex items-start gap-4">
              <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                style={{ backgroundColor: theme.accentColor + '22', color: theme.accentColor }}>
                <span className="text-[10px] font-bold">✓</span>
              </div>
              <p className={`text-sm leading-[1.7] ${fontCnClass}`}
                style={{ color: '#37352F', letterSpacing: '0.02em' }}>
                {block.text.replace(/^✓\s*/, '')}
              </p>
            </div>
          ))}
        </div>

        {hasContent && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <div className="w-8 h-[1px]" style={{ backgroundColor: theme.accentColor }} />
            <span className={`text-[10px] font-medium tracking-[0.2em] uppercase opacity-40 ${fontMagazineClass}`}
              style={{ color: '#37352F' }}>
              END
            </span>
            <div className="w-8 h-[1px]" style={{ backgroundColor: theme.accentColor }} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CTA Card ─────────────────────────────────────────────────────────────────

function CTACard({ card, journalConfig, font, theme }: CardLayoutProps) {
  const textureStyle = getTextureStyle(theme.texture);
  const fontCnClass = font.fontId === 'modern' ? 'font-sans-cn' : 'font-serif-cn';
  const fontMagazineClass = font.fontId === 'artistic' ? 'font-handwriting' : 'font-magazine';
  const fontHandwriting = font.fontId === 'artistic' ? 'font-handwriting' : 'font-magazine';

  const hasMainText = card.blocks[0]?.text && card.blocks[0].text.trim();
  const hasAdditionalBlocks = card.blocks.slice(1).some(block => block.text.trim());
  const hasJournalInfo = journalConfig.journalName || journalConfig.issueNumber;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: theme.accentColor }}>
      {theme.texture !== 'none' && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: textureStyle, opacity: 0.4 }} />
      )}
      <div className="relative z-10 w-full px-10 text-center">
        {hasMainText && (
          <div className={`text-3xl font-bold mb-6 leading-[1.3] ${fontHandwriting}`}
            style={{ color: '#FFFFFF', opacity: 0.95 }}>
            {card.blocks[0].text}
          </div>
        )}

        {hasMainText && hasAdditionalBlocks && (
          <div className="w-12 h-[1.5px] mx-auto mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.4)' }} />
        )}

        {card.blocks.slice(1).map(block => (
          block.text.trim() && (
            <p key={block.id} className={`text-sm mb-3 leading-[1.7] ${fontCnClass}`}
              style={{ color: 'rgba(255,255,255,0.85)', letterSpacing: '0.03em' }}>
              {block.text}
            </p>
          )
        ))}

        {(hasJournalInfo || journalConfig.socialHandle) && (
          <div className="mt-10">
            {hasJournalInfo && (
              <div className={`text-[10px] font-medium tracking-[0.3em] uppercase opacity-60 ${fontMagazineClass}`}
                style={{ color: '#FFFFFF' }}>
                {journalConfig.journalName}{journalConfig.journalName && journalConfig.issueNumber ? ' · ' : ''}{journalConfig.issueNumber}
              </div>
            )}
            {journalConfig.socialHandle && (
              <div className="text-xs mt-2 font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {journalConfig.socialHandle}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Renderer ────────────────────────────────────────────────────────────

export function CardLayoutRenderer({ card, ...props }: CardLayoutProps) {
  const content = (() => {
    switch (card.type) {
      case CardType.COVER:   return <CoverCard card={card} {...props} />;
      case CardType.GUIDE:   return <GuideCard card={card} {...props} />;
      case CardType.SUMMARY: return <SummaryCard card={card} {...props} />;
      case CardType.CTA:     return <CTACard card={card} {...props} />;
      default: {
        // For body cards, use the layout style to determine the layout
        const layoutStyle = props.layoutStyle ?? 'quiet';
        if (layoutStyle === 'dual-column') {
          return <DualColumnLayout card={card} {...props} />;
        }
        return <BodyCard card={card} {...props} />;
      }
    }
  })();

  return (
    <div id={props.id} className="w-full h-full">
      {content}
    </div>
  );
}
