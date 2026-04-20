// F003 / F053 - 左侧边栏（可调宽）
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { CoreInsightsInput } from './CoreInsightsInput';
import { FullTextInput } from './FullTextInput';
import { StyleSelector } from './StyleSelector';
import { CoverPanel } from '../cover/CoverPanel';
import { TemplateManager } from './TemplateManager';
import { ExportPanel } from '../export/ExportPanel';

interface SectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function AccordionSection({ title, defaultOpen = true, children }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-qc-border-light last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-qc-hover transition-colors"
      >
        <span className="text-xs font-semibold text-qc-text-secondary uppercase tracking-widest">
          {title}
        </span>
        <ChevronDown
          size={14}
          className={`text-qc-text-tertiary transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 pt-1 space-y-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface SidebarProps {
  width: number;
}

export function Sidebar({ width }: SidebarProps) {
  return (
    <aside
      style={{ width, flexShrink: 0 }}
      className="h-screen overflow-y-auto bg-qc-sidebar border-r border-qc-border-light flex flex-col"
    >
      {/* 顶部 Logo */}
      <div className="px-5 py-4 border-b border-qc-border-light flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#7C8C3E' }}>
            <span className="text-white text-sm font-bold">Q</span>
          </div>
          <div>
            <div className="text-xs font-bold tracking-widest uppercase text-qc-text-primary">
              QUIET CARD
            </div>
            <div className="text-[10px] text-qc-text-tertiary tracking-wider">期刊式卡片生成器</div>
          </div>
        </div>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto">
        {/* 封面设计：整合版（F025/F026/F029/F030/F035/F055） */}
        <AccordionSection title="封面设计" defaultOpen={true}>
          <CoverPanel />
        </AccordionSection>

        <AccordionSection title="核心观点" defaultOpen={true}>
          <CoreInsightsInput />
        </AccordionSection>

        <AccordionSection title="全文内容" defaultOpen={true}>
          <FullTextInput />
        </AccordionSection>

        <AccordionSection title="风格设计" defaultOpen={false}>
          <StyleSelector />
        </AccordionSection>

        <AccordionSection title="模板管理" defaultOpen={false}>
          <TemplateManager />
        </AccordionSection>

        <AccordionSection title="导出" defaultOpen={false}>
          <ExportPanel />
        </AccordionSection>
      </div>
    </aside>
  );
}
