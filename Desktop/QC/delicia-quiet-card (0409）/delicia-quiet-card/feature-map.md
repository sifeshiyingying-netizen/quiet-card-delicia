# Feature Map - Delicia Quiet Card

**版本**: v1.0.0 | **更新**: 2026-04-04

## 状态说明
- ✅ 已完成并接入 UI
- 🔄 部分实现（工具函数存在，UI 接入）
- ⏳ 计划中
- ❌ 不实现

---

## F001 - F010: 设计系统与布局

| ID | 功能 | 状态 | 文件 | 备注 |
|----|------|------|------|------|
| F001 | 设计系统 CSS 变量 + Tailwind 主题 | ✅ | `src/index.css` | 完整颜色/字体/阴影变量 |
| F002 | 顶部工具栏 (60px 高) | ✅ | `components/editor/Toolbar.tsx` | 翻页/撤销/封面/保存/历史/导出全部 |
| F003 | 左侧边栏 (380px 折叠式) | ✅ | `components/editor/Sidebar.tsx` | 6大折叠区 |
| F004 | 主预览区布局 | ✅ | `App.tsx` | 双栏布局 |
| F005 | 核心观点 Notion 风格输入框 | ✅ | `components/editor/CoreInsightsInput.tsx` | |
| F006 | 添加/删除观点动态控制 (3-5个) | ✅ | `components/editor/CoreInsightsInput.tsx` | |
| F007 | 全文粘贴区 (textarea, 5000+字) | ✅ | `components/editor/FullTextInput.tsx` | 字数统计 + 警示 |
| F008 | 自动识别 H1/H2/P 三级分类 | ✅ | `utils/contentParser.ts` | 中文序号/数字序号/Markdown |
| F009 | 内容块类型手动调整并触发重新分页 | ✅ | `components/editor/FullTextInput.tsx` + `store/appStore.ts` | 修改后立即重算卡片 |
| F010 | 排版风格选择 (Quiet/Editorial/Soft) | ✅ | `components/editor/StyleSelector.tsx` | |

## F011 - F020: 字体主题与预览

| ID | 功能 | 状态 | 文件 | 备注 |
|----|------|------|------|------|
| F011 | 字体组合选择 (3种版权安全组合) | ✅ | `components/editor/StyleSelector.tsx` | |
| F012 | 主题配色选择 (8种主题) | ✅ | `components/editor/StyleSelector.tsx` | |
| F013 | iPhone 手机模拟框 (390px) | ✅ | `components/preview/PhoneMockup.tsx` | 120×28 刘海 |
| F014 | 点状页码指示器 + Framer Motion 动画 | ✅ | `components/preview/PhoneMockup.tsx` | |
| F015 | 比例切换 (4:3/15:9/1:1) | ✅ | `components/preview/PhoneMockup.tsx` | |
| F016 | 智能提示框（页数/风格建议）| ✅ | `components/preview/PhoneMockup.tsx` | |
| F017 | 卡片呼吸感排版 (H1/H2/P 三级, 1.8行高) | ✅ | `index.css` + `CardLayout.tsx` | |
| F018 | 核心分页算法 v2（段落跨页切割，版面填满） | ✅ | `utils/paginator.ts` + `utils/maxCharCalculator.ts` | SAFETY=0.90，MIN_SPLIT=2行，句子边界切割；期号纯文本显示 |
| F019 | Framer Motion 卡片切换动画 | ✅ | `components/preview/PhoneMockup.tsx` | fade+scale |
| F020 | 页面结构可视化气泡预览 | ✅ | `components/preview/PageStructurePreview.tsx` | |

## F021 - F030: 卡片控制与封面

| ID | 功能 | 状态 | 文件 | 备注 |
|----|------|------|------|------|
| F021 | 卡片类型切换 | ✅ | `components/preview/PageStructurePreview.tsx` | |
| F022 | 导读卡片生成（序号列表） | ✅ | `utils/paginator.ts` + `CardLayout.tsx` | |
| F023 | 手动分页（分割长段落，触发重新分页） | ✅ | `utils/paginator.ts` + `FullTextInput.tsx` + `store/appStore.ts` | 悬停 P 块可见剪刀按钮，SPLIT_BLOCK action |
| F024 | 孤标题防护算法（含整页单 H1） | ✅ | `utils/paginator.ts` | 整页单 H1 也会移至下一页；完成后重新编号 |
| F025 | 封面设计面板（侧边栏统一，替代旧弹窗） | ✅ | `components/cover/CoverPanel.tsx` | 迷你预览 + 模板 + 配色 + 图片 + 内容字段，整合到 Sidebar |
| F026 | 封面文字信息配置（标题/期号纯文本/日期等） | ✅ | `components/cover/CoverPanel.tsx` | 期号无自动格式包裹 |
| F027 | 6种封面模板 | ✅ | `CardLayout.tsx` (6个独立组件) | 模板选择完整接入渲染 |
| F028 | 封面实时预览（侧边栏迷你） | ✅ | `components/cover/CoverPanel.tsx` | |
| F029 | 5种预设配色 + 自定义 hex 方案 | ✅ | `types/index.ts` + `CardLayout.tsx` | `CoverConfig.customScheme`；`resolveScheme()` 处理 custom 分支 |
| F030 | 封面照片上传（CSS filter 适配）| ✅ | `components/cover/CoverPanel.tsx` | photoFilter 应用到渲染 |

## F031 - F040: 导出与工具

| ID | 功能 | 状态 | 文件 | 备注 |
|----|------|------|------|------|
| F031 | 单张导出 PNG @2x | ✅ | `utils/exporter.ts` + `ExportPanel.tsx` | html2canvas scale=2 |
| F032 | 批量导出 ZIP (JSZip) | ✅ | `utils/exporter.ts` + `ExportPanel.tsx` | 真实卡片DOM渲染后导出 |
| F033 | 导出进度提示 | ✅ | `components/export/ExportPanel.tsx` | 内联状态显示 |
| F034 | 撤销/重做 (50步, Ctrl+Z/Shift+Z) | ✅ | `utils/historyManager.ts` + `store/appStore.ts` | |
| F035 | Logo 上传 | ✅ | `components/editor/LogoUploader.tsx` | |
| F036 | 字体预加载优化 | ✅ | `utils/fontLoader.ts` + `index.html` | |
| F037 | 模板保存/复用 UI | ✅ | `components/editor/TemplateManager.tsx` | 侧边栏"模板管理"区 |
| F038 | 历史记录管理 UI | ✅ | `components/editor/Toolbar.tsx` | 工具栏历史下拉面板 |
| F039 | 空状态引导（三步操作提示 + 动效） | ✅ | `components/preview/PhoneMockup.tsx` | 含 Framer Motion 入场动画 |
| F040 | TypeScript 完整类型定义 | ✅ | `types/index.ts` | |

## F041 - F052: 数据类型与工具函数

| ID | 功能 | 状态 | 文件 |
|----|------|------|------|
| F041 | ContentBlock 接口 | ✅ | `types/index.ts` |
| F042 | Card 接口 + CardType 枚举 | ✅ | `types/index.ts` |
| F043 | JournalConfig 接口 | ✅ | `types/index.ts` |
| F044 | CoverConfig 接口 + 5种配色方案数据 | ✅ | `types/index.ts` |
| F045 | 日期格式化 (YYYY.MM.DD) | ✅ | `utils/formatters.ts` |
| F046 | 期号格式化（按模板自适应）| ✅ | `utils/formatters.ts` |
| F047 | 最大字符数计算器 | ✅ | `utils/maxCharCalculator.ts` |
| F048 | 标题识别规则 (中文序号/数字序号/Markdown) | ✅ | `utils/contentParser.ts` |
| F049 | 纸张纹理 SVG 生成器 (细纹/粗纹) | ✅ | `utils/textureGenerator.ts` |
| F050 | 主应用布局 | ✅ | `App.tsx` |
| F051 | React Context 全局状态管理 | ✅ | `store/appStore.ts` |
| F052 | HistoryEntry 接口 + HistoryManager | ✅ | `utils/historyManager.ts` |

---

## 布局规格符合性

| 规格 | 要求 | 实现 |
|------|------|------|
| 顶部工具栏高度 | 60px | ✅ `height: 60` |
| 左侧边栏宽度 | 380px | ✅ `w-[380px]` |
| 手机模拟框宽度 | 390px | ✅ `width: 390px` |
| 刘海尺寸 | 120×28px | ✅ `w-[120px] h-[28px]` |
| 侧边栏内边距 | 24px | ✅ `px-4 pb-5`（≈24px） |

---

## 整体完成率

**总功能数**: 52 | **已完成**: 52 | **完成率**: 100%

---

## 文件结构

```
src/
├── App.tsx                          # F050 主布局
├── index.css                        # F001 设计系统
├── main.tsx
├── types/
│   └── index.ts                     # F040-F044 完整类型
├── utils/
│   ├── contentParser.ts             # F008 F048
│   ├── exporter.ts                  # F031 F032
│   ├── fontLoader.ts                # F036
│   ├── formatters.ts                # F045 F046
│   ├── historyManager.ts            # F034 F052
│   ├── maxCharCalculator.ts         # F047
│   ├── paginator.ts                 # F018 F023 F024
│   ├── templateManager.ts           # F037 (localStorage)
│   └── textureGenerator.ts          # F049
├── store/
│   └── appStore.ts                  # F051
└── components/
    ├── editor/
    │   ├── CoreInsightsInput.tsx    # F005 F006
    │   ├── FullTextInput.tsx        # F007 F008 F009
    │   ├── JournalInfoForm.tsx      # F026
    │   ├── LogoUploader.tsx         # F035
    │   ├── Sidebar.tsx              # F003 F053
    │   ├── StyleSelector.tsx        # F010 F011 F012
    │   ├── TemplateManager.tsx      # F037
    │   └── Toolbar.tsx              # F002 F038
    ├── preview/
    │   ├── CardLayout.tsx           # F017 F027 F029 F055
    │   ├── PageStructurePreview.tsx # F020 F021
    │   └── PhoneMockup.tsx          # F013-F016 F019
    ├── cover/
    │   └── CoverDesigner.tsx        # F025-F030 F055
    └── export/
        └── ExportPanel.tsx          # F031-F033
```

## F053 - F055: 新增功能（v1.1.0）

| ID | 功能 | 状态 | 文件 | 备注 |
|----|------|------|------|------|
| F053 | 期刊信息优先展示 | ✅ | `Sidebar.tsx` | 移至核心观点上方，默认展开 |
| F054 | 左右拖拽分隔条 | ✅ | `App.tsx` | 280–640px 范围，mouse drag |
| F055 | 三种照片封面版式 | ✅ | `CardLayout.tsx`, `CoverDesigner.tsx` | 照片下方/中部/全屏 + 占位引导 |

## F056-F062: 性能优化与UI显示优化（v1.1.2）

| ID | 功能 | 状态 | 文件 | 备注 |
|----|------|------|------|------|
| F056 | 输入防抖优化 | ✅ | `src/store/appStore.ts`, `src/components/editor/CoreInsightsInput.tsx`, `src/components/editor/FullTextInput.tsx` | 避免每次按键都触发重新计算 |
| F057 | 自动保存功能 | ✅ | `src/utils/autoSaveManager.ts`, `src/store/appStore.ts` | 内容自动保存到localStorage |
| F058 | 状态恢复机制 | ✅ | `src/store/appStore.ts` | 页面刷新后自动恢复编辑状态 |
| F059 | 内容驱动显示 | ✅ | `src/components/preview/CardLayout.tsx` | 只显示用户输入的内容，隐藏默认文字和空占位 |
| F060 | 简洁封面布局 | ✅ | `src/components/preview/CardLayout.tsx`, `src/components/cover/CoverPanel.tsx` | 移除固定文案如"COVER STORY"，简化封面配置 |
| F061 | 智能元素显示 | ✅ | `src/components/preview/CardLayout.tsx` | 根据用户输入内容智能显示/隐藏相关UI元素 |
| F062 | 完整状态保存 | ✅ | `src/utils/autoSaveManager.ts`, `src/store/appStore.ts` | 保存完整的编辑状态，包括卡片布局和页面位置 |
| F063 | 字体大小选择器 | ✅ | `src/components/editor/FontSizeSelector.tsx`, `src/types/index.ts`, `src/store/appStore.ts`, `src/index.css`, `src/components/preview/CardLayout.tsx` | 提供小号、标准、大号三种字体大小选项 |
| F064 | 手动更新按钮 | ✅ | `src/components/editor/Toolbar.tsx`, `src/store/appStore.ts` | 在工具栏添加更新按钮，允许用户手动触发预览刷新 |
| F065 | 双栏排版模式 | ✅ | `src/types/index.ts`, `src/components/editor/StyleSelector.tsx`, `src/components/preview/CardLayout.tsx` | 增加双栏排版模式，提高文字密度，适合长篇文章 |
| F066 | 封面上半图片填充 | ✅ | `src/types/index.ts`, `src/components/preview/CardLayout.tsx`, `src/components/cover/CoverPanel.tsx` | 封面图片填充上半部分，保留空间给logo和标题 |

## v1.1.1 Bug 修复

| 文件 | 变更 |
|------|------|
| `src/utils/maxCharCalculator.ts` | 基于 RENDER_WIDTH=360px 重写，4:3→196 chars，15:9→272，1:1→136（原值 ~935 错误 4.8×） |
| `src/utils/__tests__/paginatorCalc.test.ts` | 新增 8 项 vitest 单元测试，验证所有比例计算正确 |
| `vitest.config.ts` | 新增 vitest 配置文件（globals:true） |
| `package.json` | 新增 `"test": "vitest run"` 脚本 |
