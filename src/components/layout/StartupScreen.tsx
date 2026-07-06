import React, { useEffect, useRef, useState } from 'react';
import {
  Search,
  Plus,
  FolderOpen,
  History,
  Sparkles,
  BookOpen,
  Tag,
  Trash2,
  Download,
  Upload,
  Copy,
  AlertTriangle,
  FileJson,
  Check,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { useTemplateStore, type Template } from '@/stores/template.store';
import { builtInTemplates, loadTemplate } from '@/utils/builtinTemplates';
import { useFileStore } from '@/stores/file.store';
import { FileActions } from '@/file/FileActions';
import { useRecoveryStore, RecoveryManager } from '@/storage/RecoveryManager';
import { toast } from '@/stores/toast.store';
import nodeForgeLogo from '../../../NodeForge Icons/NodeForge logo.png';

export const StartupScreen: React.FC = () => {
  const {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    customTemplates,
    loadCustomTemplates,
    deleteCustomTemplate,
    duplicateTemplate,
    exportTemplate,
    importTemplate,
  } = useTemplateStore();

  const { recentFiles, clearRecentFiles } = useFileStore();
  const { hasRecoveryData, recoveryRecord } = useRecoveryStore();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  useEffect(() => {
    loadCustomTemplates();
  }, [loadCustomTemplates]);

  // Combine built-in and custom templates
  const allTemplates = [...builtInTemplates, ...customTemplates];

  // Filter templates
  const filteredTemplates = allTemplates.filter((template) => {
    // Category check
    if (selectedCategory === 'Custom Templates') {
      if (!template.isCustom) return false;
    } else if (selectedCategory !== 'All') {
      if (template.category !== selectedCategory || template.isCustom) return false;
    }

    // Search query check
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = template.title.toLowerCase().includes(q);
      const matchDesc = template.description.toLowerCase().includes(q);
      const matchTag = template.tags.some((tag) => tag.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchTag;
    }

    return true;
  });

  // Calculate template counts per category
  const getCategoryCount = (category: string) => {
    if (category === 'All') {
      return builtInTemplates.length + customTemplates.length;
    }
    if (category === 'Custom Templates') {
      return customTemplates.length;
    }
    return builtInTemplates.filter((t) => t.category === category).length;
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importTemplate(content);
      if (success) {
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 2000);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  // Render a visual miniature graphic corresponding to the template type
  const renderTemplateMiniPreview = (template: Template) => {
    const isDark = document.body.classList.contains('dark') || true; // NodeForge defaults to dark theme

    if (template.category === 'Flowcharts') {
      return (
        <svg className="w-full h-full p-6 text-accent opacity-85" viewBox="0 0 160 100" fill="none">
          <rect x="65" y="10" width="30" height="15" rx="7" className="stroke-accent fill-accent-muted" strokeWidth="1.5" />
          <rect x="60" y="42" width="40" height="18" rx="2" className="stroke-accent fill-accent-muted" strokeWidth="1.5" />
          <polygon points="80,72 95,82 80,92 65,82" className="stroke-accent fill-accent-muted" strokeWidth="1.5" />
          <path d="M80,25 L80,42 M80,60 L80,72" className="stroke-accent" strokeWidth="1.5" strokeDasharray="3 2" />
        </svg>
      );
    }
    if (template.category === 'UML') {
      return (
        <svg className="w-full h-full p-6 text-purple-400 opacity-85" viewBox="0 0 160 100" fill="none">
          <rect x="15" y="15" width="50" height="35" rx="1" stroke="currentColor" fill="rgba(168,85,247,0.1)" strokeWidth="1.5" />
          <line x1="15" y1="26" x2="65" y2="26" stroke="currentColor" strokeWidth="1" />
          <rect x="95" y="25" width="50" height="35" rx="1" stroke="currentColor" fill="rgba(168,85,247,0.1)" strokeWidth="1.5" strokeDasharray="3 2" />
          <line x1="95" y1="36" x2="145" y2="36" stroke="currentColor" strokeWidth="1" />
          <path d="M65,32 L95,32" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
        </svg>
      );
    }
    if (template.category === 'Entity Relationship Diagrams') {
      return (
        <svg className="w-full h-full p-6 text-sky-400 opacity-85" viewBox="0 0 160 100" fill="none">
          <rect x="15" y="20" width="50" height="40" rx="1" stroke="currentColor" fill="rgba(14,165,233,0.1)" strokeWidth="1.5" />
          <line x1="15" y1="31" x2="65" y2="31" stroke="currentColor" strokeWidth="1.5" />
          <line x1="40" y1="31" x2="40" y2="60" stroke="currentColor" strokeWidth="1" />
          <rect x="95" y="20" width="50" height="40" rx="1" stroke="currentColor" fill="rgba(14,165,233,0.1)" strokeWidth="1.5" />
          <line x1="95" y1="31" x2="145" y2="31" stroke="currentColor" strokeWidth="1.5" />
          <line x1="120" y1="31" x2="120" y2="60" stroke="currentColor" strokeWidth="1" />
          <path d="M65,40 L95,40" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="70" cy="40" r="2.5" fill="currentColor" />
          <path d="M90,36 L95,40 L90,44" stroke="currentColor" strokeWidth="1" />
        </svg>
      );
    }
    if (template.category === 'AWS Architecture') {
      return (
        <svg className="w-full h-full p-6 text-amber-500 opacity-85" viewBox="0 0 160 100" fill="none">
          <rect x="10" y="10" width="140" height="80" rx="4" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
          <rect x="25" y="30" width="30" height="30" rx="3" stroke="currentColor" fill="rgba(245,158,11,0.1)" strokeWidth="1.5" />
          <rect x="75" y="30" width="30" height="30" rx="15" stroke="currentColor" fill="rgba(245,158,11,0.1)" strokeWidth="1.5" />
          <rect x="120" y="35" width="20" height="20" rx="2" stroke="currentColor" fill="rgba(245,158,11,0.1)" strokeWidth="1.5" />
          <path d="M55,45 L75,45 M105,45 L120,45" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    }
    if (template.category === 'Network Diagrams') {
      return (
        <svg className="w-full h-full p-6 text-emerald-400 opacity-85" viewBox="0 0 160 100" fill="none">
          <path d="M30,50 C20,50 20,40 30,40 C30,30 45,30 45,40 C55,40 55,50 45,50 Z" stroke="currentColor" fill="rgba(16,185,129,0.1)" strokeWidth="1.5" />
          <rect x="70" y="40" width="30" height="20" rx="1" stroke="currentColor" fill="rgba(16,185,129,0.1)" strokeWidth="1.5" />
          <circle cx="125" cy="30" r="10" stroke="currentColor" fill="rgba(16,185,129,0.1)" strokeWidth="1.5" />
          <circle cx="125" cy="65" r="10" stroke="currentColor" fill="rgba(16,185,129,0.1)" strokeWidth="1.5" />
          <path d="M45,45 L70,50 M100,50 L115,35 M100,50 L115,65" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    }
    if (template.category === 'Org Charts') {
      return (
        <svg className="w-full h-full p-6 text-indigo-400 opacity-85" viewBox="0 0 160 100" fill="none">
          <rect x="65" y="10" width="30" height="18" rx="2" stroke="currentColor" fill="rgba(99,102,241,0.1)" strokeWidth="1.5" />
          <rect x="25" y="55" width="30" height="18" rx="2" stroke="currentColor" fill="rgba(99,102,241,0.1)" strokeWidth="1.5" />
          <rect x="105" y="55" width="30" height="18" rx="2" stroke="currentColor" fill="rgba(99,102,241,0.1)" strokeWidth="1.5" />
          <path d="M80,28 L80,43 M40,43 L120,43 M40,43 L40,55 M120,43 L120,55" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    }
    if (template.category === 'Mind Maps') {
      return (
        <svg className="w-full h-full p-6 text-pink-400 opacity-85" viewBox="0 0 160 100" fill="none">
          <rect x="55" y="38" width="50" height="24" rx="12" stroke="currentColor" fill="rgba(236,72,153,0.15)" strokeWidth="2" />
          <circle cx="25" cy="25" r="10" stroke="currentColor" fill="rgba(236,72,153,0.05)" strokeWidth="1.5" />
          <circle cx="25" cy="75" r="10" stroke="currentColor" fill="rgba(236,72,153,0.05)" strokeWidth="1.5" />
          <circle cx="135" cy="25" r="10" stroke="currentColor" fill="rgba(236,72,153,0.05)" strokeWidth="1.5" />
          <circle cx="135" cy="75" r="10" stroke="currentColor" fill="rgba(236,72,153,0.05)" strokeWidth="1.5" />
          <path d="M55,50 C40,50 35,35 35,25 M55,50 C40,50 35,65 35,75 M105,50 C120,50 125,35 125,25 M105,50 C120,50 125,65 125,75" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    }
    if (template.category === 'Process Workflows') {
      return (
        <svg className="w-full h-full p-6 text-teal-400 opacity-85" viewBox="0 0 160 100" fill="none">
          <line x1="10" y1="10" x2="150" y2="10" stroke="currentColor" strokeWidth="1.5" />
          <line x1="10" y1="50" x2="150" y2="50" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="10" y1="90" x2="150" y2="90" stroke="currentColor" strokeWidth="1.5" />
          <rect x="25" y="20" width="30" height="20" rx="2" stroke="currentColor" fill="rgba(45,212,191,0.1)" strokeWidth="1.5" />
          <rect x="75" y="60" width="30" height="20" rx="2" stroke="currentColor" fill="rgba(45,212,191,0.1)" strokeWidth="1.5" />
          <rect x="120" y="20" width="20" height="20" rx="10" stroke="currentColor" fill="rgba(45,212,191,0.1)" strokeWidth="1.5" />
          <path d="M55,30 L65,30 L65,70 L75,70 M105,70 L115,70 L115,30 L120,30" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    }

    // Default Custom template icon
    return (
      <div className="w-full h-full flex items-center justify-center text-text-tertiary">
        <FileJson className="w-12 h-12 stroke-[1.2] opacity-50" />
      </div>
    );
  };

  const categories = [
    'All',
    'Flowcharts',
    'UML',
    'Entity Relationship Diagrams',
    'AWS Architecture',
    'Network Diagrams',
    'Org Charts',
    'Mind Maps',
    'Process Workflows',
    'Custom Templates',
  ];

  return (
    <div className="w-full h-full flex bg-surface overflow-hidden text-text select-none font-sans">
      {/* Hidden File Input for template imports */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      {/* ─── SIDEBAR ─── */}
      <aside className="w-72 bg-surface-raised border-r border-border flex flex-col shrink-0 overflow-hidden">
        {/* Logo and Brand */}
        <div className="p-6 border-b border-border flex items-center gap-3">
          <img src={nodeForgeLogo} alt="NodeForge" className="w-8 h-8 object-contain rounded" />
          <div>
            <h1 className="text-md font-bold tracking-tight text-text">NodeForge</h1>
            <p className="text-3xs text-text-tertiary font-semibold uppercase tracking-wider">Offline Desktop Editor</p>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="p-4 flex flex-col gap-2">
          <button
            onClick={() => FileActions.forceNewProject()}
            className="w-full py-2.5 px-4 bg-accent hover:bg-accent-hover text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Blank Diagram
          </button>
          <button
            onClick={() => FileActions.openProject()}
            className="w-full py-2.5 px-4 bg-surface-overlay hover:bg-surface border border-border hover:border-border-strong text-text rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all duration-150 active:scale-95"
          >
            <FolderOpen className="w-4 h-4" />
            Open Diagram File
          </button>
        </div>

        {/* Search Field */}
        <div className="px-4 py-2 border-b border-border">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-surface-sunken border border-border-subtle rounded-lg text-text placeholder-text-tertiary focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
          <h2 className="text-3xs font-semibold text-text-tertiary uppercase tracking-wider mb-2 px-2">Categories</h2>
          {categories.map((category) => {
            const count = getCategoryCount(category);
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-text-secondary hover:text-text hover:bg-surface-overlay'
                }`}
              >
                <span className="truncate">{category === 'Entity Relationship Diagrams' ? 'Entity Relationship (ERD)' : category}</span>
                <span
                  className={`text-2xs font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-surface-sunken text-text-tertiary'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Workspace Footer Info */}
        <div className="p-4 border-t border-border flex items-center justify-between text-3xs text-text-tertiary font-medium">
          <span>v1.0.0 Stable</span>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              toast.info("NodeForge offline documentation is under construction.");
            }}
            className="hover:underline flex items-center gap-1 hover:text-text"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Docs & Help
          </a>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ─── */}
      <main className="flex-1 bg-surface-sunken flex flex-col overflow-hidden">
        {/* Top Header Greetings */}
        <header className="p-8 pb-4 shrink-0 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-text">Welcome to NodeForge</h2>
            <p className="text-xs text-text-secondary mt-1">Design system architecture, workflows, and database tables in a high-fidelity offline canvas.</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 pb-8 flex flex-col gap-6">
          {/* Recovery Banner Alert (Inside dashboard for prompt requirements) */}
          {hasRecoveryData && recoveryRecord && (
            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-xl p-5 flex items-start gap-4 shadow-md animate-fade-in">
              <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-bold text-amber-300">Unsaved Auto-Recovery Session Found</h4>
                <p className="text-xs text-text-secondary mt-1">
                  The application was closed unexpectedly. You can restore your unsaved session of **"{recoveryRecord.originalFileName}"** autosaved at {new Date(recoveryRecord.savedAt).toLocaleTimeString()}.
                </p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => RecoveryManager.restoreSession()}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-xs shadow-sm transition-all duration-150"
                  >
                    Restore Session
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to permanently discard the auto-recovered session? This cannot be undone.')) {
                        RecoveryManager.discardSession();
                      }
                    }}
                    className="px-3.5 py-1.5 bg-surface-overlay hover:bg-surface border border-border hover:border-border-strong text-text-secondary hover:text-text rounded-lg font-semibold text-xs transition-all duration-150"
                  >
                    Discard Recovery
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── RECENT PROJECTS SECTION ─── */}
          {recentFiles.length > 0 && selectedCategory === 'All' && !searchQuery && (
            <section className="shrink-0 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-border-subtle pb-1">
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Recent Projects
                </h3>
                <button
                  onClick={() => {
                    if (confirm('Clear the list of recent projects? The files will not be deleted from your disk.')) {
                      clearRecentFiles();
                    }
                  }}
                  className="text-3xs text-text-tertiary hover:text-status-error font-semibold hover:underline"
                >
                  Clear Recents
                </button>
              </div>

              {/* Recents horizontal scroll or vertical grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentFiles.slice(0, 3).map((file) => (
                  <div
                    key={file.filePath}
                    onClick={() => FileActions.loadProject(file.filePath)}
                    className="p-4 bg-surface-raised border border-border hover:border-accent/40 rounded-xl cursor-pointer group shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="truncate flex-1 pr-2">
                        <h4 className="text-xs font-bold text-text group-hover:text-accent-hover truncate transition-colors">
                          {file.fileName.replace(/\.nodeforge$/, '')}
                        </h4>
                        <p className="text-3xs text-text-tertiary truncate font-mono mt-1">
                          {file.filePath}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-text-tertiary group-hover:text-accent transition-colors shrink-0" />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-3xs text-text-tertiary">
                      <span>Opened {new Date(file.lastOpened).toLocaleDateString()}</span>
                      <span className="opacity-0 group-hover:opacity-100 text-accent font-bold transition-opacity">Open &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ─── TEMPLATES CATALOG SECTION ─── */}
          <section className="flex-1 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-border-subtle pb-1">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {selectedCategory === 'All' ? 'Template Templates' : selectedCategory}
              </h3>
              
              {selectedCategory === 'Custom Templates' && (
                <button
                  onClick={handleImportClick}
                  className={`text-2xs font-semibold px-2.5 py-1 rounded border border-border-subtle bg-surface-raised hover:bg-surface flex items-center gap-1.5 transition-colors ${
                    importSuccess ? 'text-status-success border-status-success/30' : 'text-text-secondary hover:text-text'
                  }`}
                >
                  {importSuccess ? <Check className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
                  {importSuccess ? 'Template Imported!' : 'Import Template JSON'}
                </button>
              )}
            </div>

            {filteredTemplates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTemplates.map((tmpl) => {
                  let difficultyColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                  if (tmpl.difficulty === 'Intermediate') {
                    difficultyColor = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
                  } else if (tmpl.difficulty === 'Advanced') {
                    difficultyColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                  }

                  return (
                    <div
                      key={tmpl.id}
                      className="flex flex-col bg-surface-raised border border-border hover:border-accent-hover/40 rounded-2xl overflow-hidden group shadow-sm hover:shadow-lg transition-all duration-200"
                    >
                      {/* Visual Preview Graphic Container */}
                      <div className="h-32 bg-surface-sunken border-b border-border relative flex items-center justify-center overflow-hidden">
                        {renderTemplateMiniPreview(tmpl)}
                        
                        {/* Hover Overlay Menu */}
                        <div className="absolute inset-0 bg-surface-raised/95 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 p-4 transition-all duration-200">
                          <button
                            onClick={() => loadTemplate(tmpl)}
                            className="w-4/5 py-1.5 bg-accent hover:bg-accent-hover text-white text-2xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Create Diagram
                          </button>
                          
                          <div className="flex gap-2 w-4/5">
                            <button
                              onClick={() => duplicateTemplate(tmpl)}
                              title="Duplicate Template"
                              className="flex-1 py-1 px-2 bg-surface-overlay hover:bg-surface border border-border-strong text-text-secondary hover:text-text rounded-md flex items-center justify-center transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => exportTemplate(tmpl)}
                              title="Export Template File"
                              className="flex-1 py-1 px-2 bg-surface-overlay hover:bg-surface border border-border-strong text-text-secondary hover:text-text rounded-md flex items-center justify-center transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            {tmpl.isCustom && (
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete the template "${tmpl.title}"?`)) {
                                    deleteCustomTemplate(tmpl.id);
                                  }
                                }}
                                title="Delete Template"
                                className="flex-1 py-1 px-2 bg-status-error/10 hover:bg-status-error/20 border border-status-error/30 text-status-error rounded-md flex items-center justify-center transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Details Block */}
                      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs font-bold text-text truncate group-hover:text-accent transition-colors" title={tmpl.title}>
                              {tmpl.title}
                            </h4>
                            <span className={`text-4xs uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded border ${difficultyColor} shrink-0`}>
                              {tmpl.difficulty}
                            </span>
                          </div>
                          <p className="text-3xs text-text-secondary mt-1.5 line-clamp-2 leading-relaxed">
                            {tmpl.description}
                          </p>
                        </div>

                        {/* Tags list */}
                        <div className="flex flex-wrap gap-1">
                          {tmpl.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-4xs px-2 py-0.5 rounded-full bg-surface-overlay border border-border-subtle text-text-tertiary font-medium uppercase tracking-wider"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-16 bg-surface-raised border border-dashed border-border rounded-2xl text-center">
                <Sparkles className="w-8 h-8 text-text-tertiary opacity-40 mb-2 stroke-[1.2]" />
                <h4 className="text-xs font-bold text-text-secondary">No templates found</h4>
                <p className="text-3xs text-text-tertiary mt-1">Try tweaking your search term or select another category.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};
