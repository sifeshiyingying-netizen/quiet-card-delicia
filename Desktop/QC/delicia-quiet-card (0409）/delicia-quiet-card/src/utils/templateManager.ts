// F037 - 模板保存/复用
import { FontConfig, ThemeConfig, StyleType, ExportRatio } from '../types';

interface StyleTemplate {
  id: string;
  name: string;
  createdAt: number;
  style: StyleType;
  font: FontConfig;
  theme: ThemeConfig;
  exportRatio: ExportRatio;
}

const STORAGE_KEY = 'quietcard_templates';

export function saveTemplate(name: string, config: Omit<StyleTemplate, 'id' | 'name' | 'createdAt'>): void {
  const templates = loadTemplates();
  const template: StyleTemplate = {
    id: `tpl_${Date.now()}`,
    name,
    createdAt: Date.now(),
    ...config,
  };
  templates.push(template);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function loadTemplates(): StyleTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function deleteTemplate(id: string): void {
  const templates = loadTemplates().filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function getTemplate(id: string): StyleTemplate | undefined {
  return loadTemplates().find(t => t.id === id);
}
