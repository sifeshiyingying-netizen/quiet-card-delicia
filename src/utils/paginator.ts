// F018 - 分页算法 + F024 孤标题防护
import {
  Card,
  CardType,
  CardStyle,
  CardLayout,
  ContentBlock,
  JournalConfig,
  ThemeConfig,
  FontConfig,
  ExportRatio,
} from '../types';
import { calculateMaxCharsPerPage, CHARS_PER_LINE } from './maxCharCalculator';

let cardIdCounter = 0;
const newId = (prefix: string) => `${prefix}_${++cardIdCounter}`;

function getCardStyle(type: string, theme: ThemeConfig): CardStyle {
  const base: CardStyle = {
    background: theme.paperColor,
    padding: '40px',
    fontSize: '14px',
    lineHeight: 1.8,
    letterSpacing: '0.02em',
    textAlign: 'left',
  };

  const overrides: Record<string, Partial<CardStyle>> = {
    cover: { fontSize: '28px', textAlign: 'center', letterSpacing: '0.08em', lineHeight: 1.4 },
    guide: { fontSize: '16px', lineHeight: 1.7 },
    summary: { fontSize: '16px', textAlign: 'center', lineHeight: 1.7 },
    cta: { fontSize: '16px', textAlign: 'center', lineHeight: 1.7 },
  };

  return { ...base, ...overrides[type] };
}

function getCardLayout(type: string, ratio: ExportRatio = '4:3'): CardLayout {
  const width = 1080;
  // Portrait dimensions: UI shows aspect-[3/4] for "4:3" and aspect-[9/15] for "15:9"
  // So "4:3" → width:height = 3:4 → height = 1080 * 4/3 = 1440
  //    "15:9" → width:height = 9:15 → height = 1080 * 15/9 = 1800
  let height = 1440;  // 4:3 portrait (was 1350 — incorrect)
  if (ratio === '15:9') height = 1800; // 9:15 portrait (was 648 — landscape bug)
  if (ratio === '1:1') height = 1080;

  return {
    width,
    height,
    maxChars: type === 'cover' ? 100 : 500,
    maxLines: type === 'cover' ? 4 : 30,
  };
}

/**
 * F018 - 核心分页算法
 * 生成结构：封面 → 导读 → 正文(N页) → 总结 → CTA
 */
export function paginateForLongForm(
  fullText: string,
  coreInsights: string[],
  contentBlocks: ContentBlock[],
  theme: ThemeConfig,
  font: FontConfig,
  journalConfig: JournalConfig,
  ratio: ExportRatio = '4:3',
  fontSize: 'small' | 'normal' | 'large' = 'normal'
): Card[] {
  const cards: Card[] = [];
  const MAX_CHARS = calculateMaxCharsPerPage({ ratio, fontScale: fontSize });

  // 1. 封面卡片
  cards.push({
    id: newId('cover'),
    type: CardType.COVER,
    pageNumber: 1,
    blocks: [{
      id: 'cover_block',
      type: 'P',
      text: coreInsights[0] || journalConfig.journalName,
      pageNumber: 1,
    }],
    style: getCardStyle('cover', theme),
    layout: getCardLayout('cover', ratio),
  });

  // 2. 导读卡片
  const guideBlocks: ContentBlock[] = coreInsights
    .filter(i => i.trim())
    .map((insight, idx) => ({
      id: `guide_block_${idx}`,
      type: 'P' as const,
      text: `${idx + 1}. ${insight}`,
      pageNumber: 2,
    }));

  cards.push({
    id: newId('guide'),
    type: CardType.GUIDE,
    pageNumber: 2,
    blocks: guideBlocks,
    style: getCardStyle('guide', theme),
    layout: getCardLayout('guide', ratio),
  });

  // 3. 分页处理正文内容块（F018 v2 — 段落可跨页切割，保证版面饱满）
  if (contentBlocks.length > 0) {
    let currentPage = 3;
    let currentBlocks: ContentBlock[] = [];
    let currentChars = 0;
    let splitCounter = 0;

    /** 将当前页内容写入 cards 并重置状态 */
    const flushPage = () => {
      if (currentBlocks.length === 0) return;
      const pageBlocks = currentBlocks.map(b => ({ ...b, pageNumber: currentPage }));
      cards.push({
        id: newId('body'),
        type: CardType.BODY,
        pageNumber: currentPage,
        blocks: pageBlocks,
        style: getCardStyle('body', theme),
        layout: getCardLayout('body', ratio),
      });
      currentPage++;
      currentBlocks = [];
      currentChars = 0;
    };

    // 段落跨页切割的最小行数门槛：至少 2 行才值得在当前页放一截
    const MIN_SPLIT = CHARS_PER_LINE * 2; // ≈ 42 chars

    /**
     * 在文本的 [0, limit] 范围内寻找最后一个句子边界。
     * 优先：中文句末标点（。！？…）> 英文句末/分号 > 逗号 > 空格 > 硬切
     * 保证切割结果至少有 MIN_SPLIT 个字符（不产生残片）。
     */
    const findSplitPoint = (text: string, limit: number): number => {
      const hard = Math.min(limit, text.length);
      const floor = MIN_SPLIT; // 切割点至少保留 floor 个字符在左侧
      if (hard <= floor) return hard; // 空间太小，直接硬切

      for (let i = hard - 1; i >= floor; i--) {
        if ('。！？…\n'.includes(text[i])) return i + 1;
      }
      for (let i = hard - 1; i >= floor; i--) {
        if ('.!?；'.includes(text[i])) return i + 1;
      }
      for (let i = hard - 1; i >= floor; i--) {
        if ('，、'.includes(text[i])) return i + 1;
      }
      for (let i = hard - 1; i >= floor; i--) {
        if (text[i] === ' ') return i + 1;
      }
      return hard;
    };

    for (const block of contentBlocks) {
      if (block.type !== 'P') {
        // ── 标题块：不切割，整体处理（含 F024 孤标题防护）──
        const blockChars = block.text.length + 10;
        if (currentChars + blockChars > MAX_CHARS && currentBlocks.length > 0) {
          flushPage();
        }
        currentBlocks.push({ ...block, pageNumber: currentPage });
        currentChars += blockChars;
        continue;
      }

      // ── 段落块：跨页切割，但保证每截至少 MIN_SPLIT 字符 ──
      let remaining = block.text;
      let isFirstSlice = true;

      while (remaining.length > 0) {
        const charsLeft = MAX_CHARS - currentChars;

        if (remaining.length <= charsLeft) {
          // 整段放得下，直接放入
          currentBlocks.push({
            ...block,
            id: isFirstSlice ? block.id : `${block.id}_s${++splitCounter}`,
            text: remaining,
            pageNumber: currentPage,
          });
          currentChars += remaining.length;
          remaining = '';
        } else if (charsLeft < MIN_SPLIT) {
          // 当前页剩余空间太少，不值得放这段的开头 → 先把当前页冲走
          flushPage();
          // remaining 不变，下一轮在新页处理
        } else {
          // 空间够放至少 MIN_SPLIT 个字符 → 切割
          const splitAt = findSplitPoint(remaining, charsLeft);
          const head = remaining.slice(0, splitAt).trim();
          remaining = remaining.slice(splitAt).trimStart();
          if (head.length > 0) {
            currentBlocks.push({
              ...block,
              id: isFirstSlice ? block.id : `${block.id}_s${++splitCounter}`,
              text: head,
              pageNumber: currentPage,
            });
            currentChars += head.length;
            isFirstSlice = false;
          }
          // 当前页满了（或刚好用完）→ 冲走，剩余在下一页
          if (remaining.length > 0) flushPage();
        }
      }
    }

    // 保存最后一页
    if (currentBlocks.length > 0) {
      const pageBlocks = currentBlocks.map(b => ({ ...b, pageNumber: currentPage }));
      cards.push({
        id: newId('body'),
        type: CardType.BODY,
        pageNumber: currentPage,
        blocks: pageBlocks,
        style: getCardStyle('body', theme),
        layout: getCardLayout('body', ratio),
      });
      currentPage++;
    }

    // F024 - 孤标题防护：后处理阶段
    const guardedCards = guardOrphanTitles(cards);

    // 4. 总结卡片（核心观点 >= 3 时生成）
    const validInsights = coreInsights.filter(i => i.trim());
    if (validInsights.length >= 3) {
      const summaryPage = guardedCards[guardedCards.length - 1].pageNumber + 1;
      const summaryBlocks: ContentBlock[] = [
        { id: 'summary_title', type: 'H1', text: '核心要点回顾', pageNumber: summaryPage },
        ...validInsights.map((insight, i) => ({
          id: `summary_${i}`,
          type: 'P' as const,
          text: `✓ ${insight}`,
          pageNumber: summaryPage,
        })),
      ];
      guardedCards.push({
        id: newId('summary'),
        type: CardType.SUMMARY,
        pageNumber: summaryPage,
        blocks: summaryBlocks,
        style: getCardStyle('summary', theme),
        layout: getCardLayout('summary', ratio),
      });
    }

    // 5. CTA 卡片
    const ctaPage = guardedCards[guardedCards.length - 1].pageNumber + 1;
    guardedCards.push({
      id: newId('cta'),
      type: CardType.CTA,
      pageNumber: ctaPage,
      blocks: [
        { id: 'cta_1', type: 'H1', text: '你的思考', pageNumber: ctaPage },
        { id: 'cta_2', type: 'P', text: '这些观点触动你了吗？', pageNumber: ctaPage },
        { id: 'cta_3', type: 'P', text: '期待在评论区看到你的想法', pageNumber: ctaPage },
        ...(journalConfig.socialHandle ? [{
          id: 'cta_4', type: 'P' as const,
          text: `关注 ${journalConfig.socialHandle}`, pageNumber: ctaPage
        }] : []),
      ],
      style: getCardStyle('cta', theme),
      layout: getCardLayout('cta', ratio),
    });

    return guardedCards;
  }

  // 没有正文内容时，只有封面+导读+CTA
  const ctaPage = 3;
  cards.push({
    id: newId('cta'),
    type: CardType.CTA,
    pageNumber: ctaPage,
    blocks: [
      { id: 'cta_1', type: 'H1', text: '你的思考', pageNumber: ctaPage },
      { id: 'cta_2', type: 'P', text: '期待在评论区看到你的想法', pageNumber: ctaPage },
    ],
    style: getCardStyle('cta', theme),
    layout: getCardLayout('cta', ratio),
  });

  return cards;
}

/**
 * F024 - 孤标题防护：H1 不得单独出现在页面底部（含整页只有一个 H1 的情况）
 * 扫描每个 BODY 卡片：
 *   1. 若整页只有一个 H1 块，合并到下一页开头
 *   2. 若最后一个块是 H1 且后面没有正文跟随，将其推到下一页开头
 */
export function guardOrphanTitles(cards: Card[]): Card[] {
  // Work on a mutable shallow copy so we can update next-page blocks in-place
  const working = cards.map(c => ({ ...c, blocks: [...c.blocks] }));
  const result: Card[] = [];

  for (let i = 0; i < working.length; i++) {
    const card = working[i];

    // Only guard BODY cards
    if (card.type !== CardType.BODY) {
      result.push(card);
      continue;
    }

    const lastBlock = card.blocks[card.blocks.length - 1];

    // Case 1: Entire page is a single H1 block (always orphan)
    // Case 2: Last block is H1 and nothing follows it on this page
    if (lastBlock?.type === 'H1') {
      const lastIdx = card.blocks.length - 1;
      const hasFollowingContent = card.blocks.slice(lastIdx + 1).length > 0;

      if (!hasFollowingContent) {
        // Remove orphan H1 from this card
        const orphanBlock = { ...lastBlock };
        const remainingBlocks = card.blocks.slice(0, -1);

        // Only push current card if it still has blocks after removing the orphan
        if (remainingBlocks.length > 0) {
          result.push({ ...card, blocks: remainingBlocks });
        }
        // else: entire card was just one H1 — skip it, orphan goes to next page

        // Prepend orphan H1 to next card (BODY preferred, summary/CTA also acceptable)
        // Never create a lone-H1 card as that itself is an orphan.
        const nextIdx = i + 1;
        if (nextIdx < working.length) {
          working[nextIdx] = {
            ...working[nextIdx],
            blocks: [
              { ...orphanBlock, pageNumber: working[nextIdx].pageNumber },
              ...working[nextIdx].blocks,
            ],
          };
        }
        // If there is no next card at all, the orphan H1 is simply dropped (it carries no body content).
        continue;
      }
    }

    result.push(card);
  }

  // Re-number pages sequentially to fix any gaps caused by card removal
  let pageNum = 1;
  for (const card of result) {
    card.pageNumber = pageNum++;
    card.blocks = card.blocks.map(b => ({ ...b, pageNumber: card.pageNumber }));
  }

  return result;
}

/**
 * F023 - 手动分页：在指定位置分割内容块
 */
export function splitBlockAtPosition(
  blocks: ContentBlock[],
  blockId: string,
  position: number
): ContentBlock[] {
  const result: ContentBlock[] = [];

  for (const block of blocks) {
    if (block.id === blockId && block.type === 'P') {
      const before = block.text.slice(0, position).trim();
      const after = block.text.slice(position).trim();

      if (before) {
        result.push({ ...block, text: before });
      }
      if (after) {
        result.push({
          ...block,
          id: `${block.id}_split`,
          text: after,
        });
      }
    } else {
      result.push(block);
    }
  }

  return result;
}
