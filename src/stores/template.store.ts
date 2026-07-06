import { create } from 'zustand';
import type { CanvasElement, Connector } from '@/types/canvas.types';
import { useCanvasStore } from './canvas.store';
import { useFileStore } from './file.store';
import { CommandManager } from '@/editor/CommandManager';
import { toast } from './toast.store';

export interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  elements: CanvasElement[];
  connectors: Connector[];
  isCustom?: boolean;
}

interface TemplateState {
  welcomeScreenOpen: boolean;
  selectedCategory: string;
  searchQuery: string;
  customTemplates: Template[];
  isSaveTemplateOpen: boolean;

  // Actions
  setWelcomeScreenOpen: (open: boolean) => void;
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setSaveTemplateOpen: (open: boolean) => void;
  loadCustomTemplates: () => void;
  saveCustomTemplate: (title: string, description: string, category: string, difficulty: 'Beginner' | 'Intermediate' | 'Advanced') => void;
  deleteCustomTemplate: (id: string) => void;
  duplicateTemplate: (template: Template) => void;
  exportTemplate: (template: Template) => void;
  importTemplate: (jsonString: string) => boolean;
}

const CUSTOM_TEMPLATES_KEY = 'nodeforge_custom_templates';

export const useTemplateStore = create<TemplateState>((set, get) => ({
  welcomeScreenOpen: true,
  selectedCategory: 'All',
  searchQuery: '',
  customTemplates: [],
  isSaveTemplateOpen: false,

  setWelcomeScreenOpen: (open) => set({ welcomeScreenOpen: open }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSaveTemplateOpen: (open) => set({ isSaveTemplateOpen: open }),

  loadCustomTemplates: () => {
    try {
      const raw = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
      if (raw) {
        set({ customTemplates: JSON.parse(raw) });
      }
    } catch (e) {
      console.error('[TemplateStore] Failed to load custom templates', e);
    }
  },

  saveCustomTemplate: (title, description, category, difficulty) => {
    const { elements, connectors } = useCanvasStore.getState();
    if (elements.length === 0 && connectors.length === 0) {
      toast.error('Cannot save an empty diagram as a template.');
      return;
    }

    const newTemplate: Template = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim() || 'My Custom Template',
      description: description.trim() || 'User defined custom template',
      category: category || 'Custom',
      tags: ['Custom'],
      difficulty: difficulty || 'Intermediate',
      elements: JSON.parse(JSON.stringify(elements)),
      connectors: JSON.parse(JSON.stringify(connectors)),
      isCustom: true,
    };

    set((state) => {
      const updated = [newTemplate, ...state.customTemplates];
      localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updated));
      return { customTemplates: updated };
    });

    toast.success(`Template "${newTemplate.title}" saved successfully!`);
  },

  deleteCustomTemplate: (id) => {
    set((state) => {
      const updated = state.customTemplates.filter((t) => t.id !== id);
      localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updated));
      return { customTemplates: updated };
    });
    toast.success('Custom template deleted.');
  },

  duplicateTemplate: (template) => {
    const duplicated: Template = {
      ...JSON.parse(JSON.stringify(template)),
      id: `custom_dup_${Date.now()}`,
      title: `${template.title} (Copy)`,
      isCustom: true,
      category: 'Custom',
      tags: [...template.tags, 'Copy'],
    };

    set((state) => {
      const updated = [duplicated, ...state.customTemplates];
      localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updated));
      return { customTemplates: updated };
    });

    toast.success(`Duplicated "${template.title}" to Custom templates.`);
  },

  exportTemplate: (template) => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(template, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `${template.title.toLowerCase().replace(/\s+/g, '_')}_template.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success(`Exported "${template.title}" template.`);
    } catch (e) {
      console.error('[TemplateStore] Failed to export template', e);
      toast.error('Failed to export template.');
    }
  },

  importTemplate: (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString) as Partial<Template>;
      if (!parsed.title || !parsed.elements || !parsed.connectors) {
        toast.error('Invalid template format. Must include title, elements, and connectors.');
        return false;
      }

      const imported: Template = {
        id: `custom_import_${Date.now()}`,
        title: parsed.title,
        description: parsed.description || 'Imported template',
        category: parsed.category || 'Custom',
        tags: parsed.tags || ['Imported'],
        difficulty: parsed.difficulty || 'Intermediate',
        elements: parsed.elements,
        connectors: parsed.connectors,
        isCustom: true,
      };

      set((state) => {
        const updated = [imported, ...state.customTemplates];
        localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updated));
        return { customTemplates: updated };
      });

      toast.success(`Imported template "${imported.title}" successfully.`);
      return true;
    } catch (e) {
      toast.error('Failed to parse template JSON file.');
      return false;
    }
  },
}));
