import React, { useState, useEffect } from 'react';
import { X, HelpCircle, Save } from 'lucide-react';
import { useTemplateStore } from '@/stores/template.store';
import { useCanvasStore } from '@/stores/canvas.store';
import { toast } from '@/stores/toast.store';

export const SaveAsTemplateDialog: React.FC = () => {
  const { isSaveTemplateOpen, setSaveTemplateOpen, saveCustomTemplate } = useTemplateStore();
  const { elements, connectors } = useCanvasStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Flowcharts');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');

  const isEmpty = elements.length === 0 && connectors.length === 0;

  // Reset inputs when opened
  useEffect(() => {
    if (isSaveTemplateOpen) {
      setTitle('');
      setDescription('');
      setCategory('Flowcharts');
      setDifficulty('Intermediate');
    }
  }, [isSaveTemplateOpen]);

  if (!isSaveTemplateOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEmpty) {
      toast.error('Cannot save an empty diagram as a template.');
      return;
    }
    if (!title.trim()) {
      toast.error('Please enter a template title.');
      return;
    }

    saveCustomTemplate(title, description, category, difficulty);
    setSaveTemplateOpen(false);
  };

  const categories = [
    'Flowcharts',
    'UML',
    'Entity Relationship Diagrams',
    'AWS Architecture',
    'Network Diagrams',
    'Org Charts',
    'Mind Maps',
    'Process Workflows',
  ];

  return (
    <div
      className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={() => setSaveTemplateOpen(false)}
    >
      <div
        className="w-[480px] bg-surface border border-border shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle shrink-0">
          <div className="flex items-center gap-2">
            <Save className="w-5 h-5 text-accent" />
            <h3 className="font-bold text-md text-text">Save Workspace as Template</h3>
          </div>
          <button
            onClick={() => setSaveTemplateOpen(false)}
            className="p-1 text-text-tertiary hover:text-text rounded-md hover:bg-surface-sunken transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
          {isEmpty && (
            <div className="bg-status-error/10 border border-status-error/20 text-status-error text-2xs p-3 rounded-lg flex items-start gap-2">
              <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Blank Canvas Detected</p>
                <p className="text-text-secondary mt-0.5">You need to add shapes or connectors to your workspace before saving it as a template.</p>
              </div>
            </div>
          )}

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-2xs font-semibold text-text-secondary uppercase tracking-wider">Template Title *</label>
            <input
              type="text"
              placeholder="e.g. Microservice Workflow, DB Schema v2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isEmpty}
              required
              className="w-full px-3 py-2 text-xs bg-surface-sunken border border-border-subtle rounded-lg text-text placeholder-text-tertiary focus:outline-none focus:border-accent disabled:opacity-50"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-2xs font-semibold text-text-secondary uppercase tracking-wider">Description</label>
            <textarea
              placeholder="Provide context or instructions for using this template..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isEmpty}
              rows={3}
              className="w-full px-3 py-2 text-xs bg-surface-sunken border border-border-subtle rounded-lg text-text placeholder-text-tertiary focus:outline-none focus:border-accent disabled:opacity-50 resize-none"
            />
          </div>

          {/* Row for Category and Difficulty */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-2xs font-semibold text-text-secondary uppercase tracking-wider">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isEmpty}
                className="w-full px-3 py-2 text-xs bg-surface-sunken border border-border-subtle rounded-lg text-text focus:outline-none focus:border-accent disabled:opacity-50"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'Entity Relationship Diagrams' ? 'Entity Relationship (ERD)' : cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-2xs font-semibold text-text-secondary uppercase tracking-wider">Complexity</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                disabled={isEmpty}
                className="w-full px-3 py-2 text-xs bg-surface-sunken border border-border-subtle rounded-lg text-text focus:outline-none focus:border-accent disabled:opacity-50"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-4 border-t border-border-subtle pt-4">
            <button
              type="button"
              onClick={() => setSaveTemplateOpen(false)}
              className="flex-1 py-2 border border-border hover:bg-surface-overlay text-text-secondary hover:text-text rounded-lg font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isEmpty || !title.trim()}
              className="flex-1 py-2 bg-accent hover:bg-accent-hover disabled:bg-accent/40 text-white rounded-lg font-semibold text-xs shadow-sm transition-colors disabled:cursor-not-allowed"
            >
              Save Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
