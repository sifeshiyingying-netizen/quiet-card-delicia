// F033 - 隐藏的导出渲染区
// 渲染尺寸与手机预览保持一致（约360px宽），通过 html2canvas scale:3 放大到 1080px
// 这样字体、间距、排版与用户看到的卡片完全一致。
import { useAppStore } from '../../store/appStore';
import { CardLayoutRenderer } from '../preview/CardLayout';

// 与 PhoneMockup 内部的卡片宽度保持一致（390px frame - 12px*2 padding = 366px ≈ 360px）
const RENDER_WIDTH = 360;

export function ExportRenderZone() {
  const { state } = useAppStore();
  const { cards, journalConfig, font, theme, coverConfig, style: layoutStyle, fontSize } = state;

  if (cards.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: '-9999px',
        width: RENDER_WIDTH,
        pointerEvents: 'none',
        zIndex: -999,
        opacity: 1,
      }}
    >
      {cards.map(card => {
        // 按比例计算高度，保持与 layout 一致的宽高比
        const renderHeight = Math.round(RENDER_WIDTH * (card.layout.height / card.layout.width));
        return (
          <div
            key={card.id}
            id={`export-card-${card.id}`}
            style={{
              width: RENDER_WIDTH,
              height: renderHeight,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <CardLayoutRenderer
              card={card}
              journalConfig={journalConfig}
              font={font}
              theme={theme}
              logoUrl={journalConfig.logoUrl}
              coverConfig={coverConfig}
              layoutStyle={layoutStyle}
              fontSize={fontSize}
            />
          </div>
        );
      })}
    </div>
  );
}
