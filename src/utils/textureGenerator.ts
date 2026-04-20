// F049 - 纹理生成器：生成 SVG 纹理背景（纸张质感）

/**
 * 生成细纹纸张纹理 SVG Data URL
 */
export function generateFineTexture(opacity = 0.04): string {
  const svg = `<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'>
    <filter id='noise'>
      <feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/>
      <feColorMatrix type='saturate' values='0'/>
    </filter>
    <rect width='100%' height='100%' filter='url(#noise)' opacity='${opacity}'/>
  </svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/**
 * 生成粗纹纸张纹理 SVG Data URL
 */
export function generateCoarseTexture(opacity = 0.06): string {
  const svg = `<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'>
    <filter id='noise'>
      <feTurbulence type='fractalNoise' baseFrequency='0.4' numOctaves='3' stitchTiles='stitch'/>
      <feColorMatrix type='saturate' values='0'/>
    </filter>
    <rect width='100%' height='100%' filter='url(#noise)' opacity='${opacity}'/>
  </svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/**
 * 根据纹理类型返回背景图片样式
 */
export function getTextureStyle(texture: 'none' | 'fine' | 'coarse'): string {
  switch (texture) {
    case 'fine': return generateFineTexture();
    case 'coarse': return generateCoarseTexture();
    default: return 'none';
  }
}
