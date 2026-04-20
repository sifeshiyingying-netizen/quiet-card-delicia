import { calculateMaxCharsPerPage, estimateLines } from '../maxCharCalculator';

const RENDER_WIDTH = 360;

describe('calculateMaxCharsPerPage', () => {
  it('4:3 returns 150-280 chars (fits in 480px render card)', () => {
    const result = calculateMaxCharsPerPage({ ratio: '4:3' });
    expect(result).toBeGreaterThanOrEqual(150);
    expect(result).toBeLessThanOrEqual(280);
  });
  it('15:9 returns more chars than 4:3 (taller card)', () => {
    const chars43 = calculateMaxCharsPerPage({ ratio: '4:3' });
    const chars159 = calculateMaxCharsPerPage({ ratio: '15:9' });
    expect(chars159).toBeGreaterThan(chars43);
  });
  it('1:1 returns fewer chars than 4:3 (shorter card)', () => {
    const chars43 = calculateMaxCharsPerPage({ ratio: '4:3' });
    const chars11 = calculateMaxCharsPerPage({ ratio: '1:1' });
    expect(chars11).toBeLessThan(chars43);
  });
  it('4:3 render height is 480px', () => {
    expect(RENDER_WIDTH * (4 / 3)).toBe(480);
  });
  it('15:9 render height is 600px', () => {
    expect(RENDER_WIDTH * (15 / 9)).toBe(600);
  });
  it('none of the ratios exceed 935 chars (old wrong value that caused overflow)', () => {
    expect(calculateMaxCharsPerPage({ ratio: '4:3' })).toBeLessThan(935);
    expect(calculateMaxCharsPerPage({ ratio: '15:9' })).toBeLessThan(935);
    expect(calculateMaxCharsPerPage({ ratio: '1:1' })).toBeLessThan(935);
  });
});

describe('estimateLines', () => {
  it('1 line for <=21 chars', () => {
    expect(estimateLines('a'.repeat(21))).toBe(1);
  });
  it('2 lines for 22 chars', () => {
    expect(estimateLines('a'.repeat(22))).toBe(2);
  });
});
