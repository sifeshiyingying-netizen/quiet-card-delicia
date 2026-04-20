// F045 - 日期格式化
// F046 - 期号格式化
import { CoverTemplate } from '../types';

/**
 * F045 - 格式化发布日期为 YYYY.MM.DD
 */
export function formatPublishDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  } catch {
    return dateStr;
  }
}

/**
 * F046 - 根据模板格式化期号
 */
export function formatIssueNumber(num: string, template: CoverTemplate): string {
  if (!num || !num.trim()) return '';
  switch (template) {
    case CoverTemplate.MAGAZINE:
    case CoverTemplate.PHOTO_MIDDLE:
      return `第 ${num} 期`;
    case CoverTemplate.POSTER:
    case CoverTemplate.MINIMAL:
    case CoverTemplate.PHOTO_BOTTOM:
    case CoverTemplate.PHOTO_FULL:
      return `NO.${num}`;
    default:
      return `NO.${num}`;
  }
}

/**
 * 获取今天的日期字符串 YYYY-MM-DD
 */
export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
