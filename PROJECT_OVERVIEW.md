# NodeForge — Executive Project Overview

**Document prepared for:** Project Supervisor / Management  
**Prepared by:** QuantumMentor-Labs  
**Date:** May 2026  
**Version:** 1.0.0

---

## 1. What Is This Application?

**NodeForge** is a fully offline, professional desktop diagramming application — similar in purpose to Microsoft Visio or the web-based Lucidchart — but built entirely in-house as a standalone desktop program that works without an internet connection.

It allows users to create visual diagrams of any kind: flowcharts, software architecture diagrams, database schemas (ER diagrams), UML software models, network topology maps, process maps, and any other node-and-connector visual.

The application runs natively on **Windows** (and can be packaged for macOS/Linux) as a proper desktop application — not a browser tab.

---

## 2. Setup & Installation

### ⚡ Quick Start (Windows)

**Double-click any of these batch files:**

| File | Purpose |
|---|---|
| **`run.bat`** | ▶ Run the application immediately (recommended) |
| **`start.bat`** | 🎯 Interactive menu with options |
| **`build.bat`** | 🔨 Build/compile code only |
| **`package.bat`** | 📦 Create a Windows installer (.exe) |
| **`install.bat`** | ⬇️ Install dependencies only |

### Requirements
- Windows operating system
- Node.js v16+ ([Download from nodejs.org](https://nodejs.org/))

### What Happens When You Run `run.bat`
1. ✓ Checks if Node.js is installed
2. ✓ Installs npm dependencies (first time only)
3. ✓ Compiles TypeScript code
4. ✓ Bundles React with Vite
5. ✓ Launches the Electron application

**First run takes 30-60 seconds.** Subsequent runs are faster.

### Manual Command Line Setup
```bash
cd "g:\Latest Working Projects\Nodeforge V 5.1.0\Draw.io"
npm install           # First time only
npm run electron:dev  # Run the application
```

### Creating a Windows Installer
```bash
npm run package
# Creates: dist/NodeForge-1.0.0.exe
```

For detailed troubleshooting, see [RUN_APP.md](RUN_APP.md).

---

## 3. Why Was This Built?

| Need | Solution |
|---|---|
| Work offline without browser dependency | Electron-based native desktop app |
| Own the toolchain (no subscription fees) | Fully in-house, MIT-licensed codebase |
| Control over shape library and branding | Custom 165+ shape library, fully extensible |
| Plugin extensibility for future automation | Built-in plugin API from day one |
| Professional-grade performance | Custom 60fps Canvas rendering engine |

---

## 4. Key Features at a Glance

### 4.1 Shape Library — 165+ Pre-Built Shapes

Users choose from a rich sidebar library organized into 8 professional categories:

| Category | Examples |
|---|---|
| **Basic Shapes** | Rectangle, Circle, Diamond, Star, Triangle, Heart, Callout, Smiley |
| **General** | Sticky Note, Shield, Badge, Tag, Hourglass |
| **Flowchart** | Process box, Decision diamond, Database, Cloud, Document, Terminal |
| **Arrows** | Block arrows (8 directions), Chevron, U-Turn, 4-Way arrow |
| **Advanced** | Table, Data grid, Card layout, Person/Avatar, Frame |
| **Misc** | Gear, Play button, Line types, Text labels |
| **UML** | Class diagram boxes, Actor, Use Case, State machine, Lifeline, Sequence |
| **Entity Relation** | Database entity tables, Crow's Foot relationship |

Shapes can be:
- Dragged from the sidebar onto the canvas
- Single-clicked to auto-place at the center of the current view
- Pinned to a personal **Scratchpad** for quick reuse across diagrams
- Drawn dynamically with the **Freehand Drawing tool** (press `P` to draw custom freehand vector shapes)

---

## 4.2 Canvas Workspace

- **Infinite canvas** — pan by holding Space+drag or using the middle mouse button; zoom in/out with `Ctrl+scroll`
- **Grid** — optional dot grid with snap-to-grid alignment
- **Minimap** — small overview panel in the corner for navigating large diagrams
- **60 fps rendering** — smooth, lag-free experience even with dozens or hundreds of shapes

---

## 4.3 Text Editing

Double-clicking any shape opens an **inline text editor** directly on the shape. Users type the label, press `Enter` to confirm or `Escape` to cancel. Font size, text alignment, and text color are all editable from the right-side Properties panel.

---

## 4.4 Resize & Move

- Drag any shape to reposition it
- **8 resize handles** appear on selection (4 corners + 4 edge midpoints) — drag any handle to resize; the cursor changes to show the exact resize direction
- Multi-select with `Shift+click` or by drawing a selection box — move or resize multiple shapes at once

---

## 4.5 Connections / Connectors

Users can draw arrows and lines between shapes to represent relationships or data flow:
- Select the Arrow/Line tool and click a source shape, then a target shape
- Supports straight, orthogonal (right-angle), and **curved (Bezier)** routing
- Connectors automatically detach or delete when endpoint shapes are removed
- Accurate arrowhead tangent alignment at endpoints and sample-based collision selection for curves

---

## 4.6 Undo / Redo

Every action — placing a shape, moving it, editing text, resizing, deleting — is fully undoable.
- `Ctrl+Z` to undo, `Ctrl+Y` to redo
- Supports up to **50 levels** of history
- Multi-step operations (e.g. grouping) are batched as a single undo step

---

## 4.7 Layers

Diagrams can be organized into **named layers** — similar to Photoshop or AutoCAD layers:
- Show or hide a layer to control what's visible
- Lock a layer to prevent accidental edits
- New shapes are placed on the currently active layer

---

## 4.8 Clipboard

Full cut, copy, and paste support:
- `Ctrl+C`, `Ctrl+X`, `Ctrl+V`
- Pasting creates new unique shapes offset by 20px to avoid overlap
- Connector links are preserved when copying connected shapes together

---

## 4.9 File Save & Open

- Save diagrams as `.drawio.json` files to the local disk using the native Windows file dialog
- Reopen saved files with full fidelity — all shapes, connectors, layers, and styling are preserved
- **Autosave** — automatically saves the current diagram every 60 seconds (configurable)
- **Crash recovery** — if the app closes unexpectedly, it detects unsaved work on next launch and offers to restore it
- **Recent projects** — tracks the last 10 opened files for quick access

---

## 4.10 Export

Finished diagrams can be exported in three formats:

| Format | Use Case |
|---|---|
| **PNG** | Embed in reports, presentations, emails |
| **SVG** | Scalable vector with 3x high-DPI rasterized fallbacks for advanced shape families |
| **PDF** | Shareable document format |

---

### 4.11 Properties Panel (Right Side)

When a shape is selected, the right panel shows all its editable properties:

| Property | What It Controls |
|---|---|
| X / Y Position | Exact canvas coordinates |
| Width / Height | Precise dimensions |
| Rotation | Angle in degrees |
| Opacity | Transparency 0–100% |
| Alignment tools | Align multiple selected shapes |
| Font Size | Text size inside the shape |
| Text Alignment | Left / Center / Right |
| Fill Color | Background color of the shape |
| Stroke Color | Border / outline color |
| Stroke Width | Border thickness |
| Text Color | Color of the label text |

---

### 4.12 Settings

A full Settings dialog with 4 sections:

| Tab | What It Controls |
|---|---|
| **Editor** | Dark/Light/System theme, Autosave, Show Grid, Snap to Grid |
| **Storage** | View localStorage data usage; clear diagram data if needed |
| **Performance** | High-quality (Retina) rendering toggle; rendering engine stats |
| **Plugins** | Enable or disable installed extension plugins |

---

### 4.13 Keyboard Shortcuts (Full List)

| Shortcut | Action |
|---|---|
| `Ctrl+Z` / `Ctrl+Y` | Undo / Redo |
| `Ctrl+C` / `Ctrl+X` / `Ctrl+V` | Copy / Cut / Paste |
| `Ctrl+A` | Select All |
| `Ctrl+D` | Duplicate selected |
| `Delete` | Remove selected |
| `Ctrl+G` / `Ctrl+Shift+G` | Group / Ungroup |
| `Ctrl++` / `Ctrl+-` | Zoom In / Out |
| `Ctrl+Shift+H` | Fit diagram to screen |
| Arrow Keys | Nudge 1px |
| `Shift+Arrow` | Nudge 10px |
| `]` / `[` | Bring to front / Send to back |
| `Escape` | Cancel current action / Close dialogs |
| `F2` or Double-click | Edit shape label |
| `Ctrl+Shift+P` | Open Command Palette |
| `Ctrl+Tab` / `Ctrl+Shift+Tab` | Next / Previous Tab Workspace |
| `Ctrl+Shift+T` | Reopen Last Closed Tab |

---

### 4.14 Template System & Onboarding

To avoid starting from an empty blank canvas, NodeForge features a professional template library and welcome experience:
- **Welcome / Starter Screen**: Launches on startup when no files are open, allowing users to start from scratch or click on pre-built templates.
- **Categorized Starter Kits**: Built-in, fully structured template designs for:
  - *Flowcharts* (Decision loops, system flows)
  - *UML Models* (Class layouts, sequence processes)
  - *Entity Relationship Diagrams* (ERD database schemas)
  - *AWS Cloud Architecture* (Auto-scaling web stacks)
  - *Network Topology* (LAN/WAN infrastructure)
  - *Org Charts* (Corporate hierarchical nodes)
  - *Mind Maps* (Brainstorming hubs)
- **Interactive Previews**: Hovering or clicking a template shows metadata and layout structure before loading it.
- **Recent Templates**: Highlights frequently used starter kits for rapid workspace initialization.
- **Cloning Engine**: Creates a clean, isolated duplicate of the template elements into a new tab workspace immediately.

---

### 4.15 Multi-Document Tab Workspaces

Users can manage multiple diagram projects concurrently with a professional tabbed workspace manager:
- **Tab Persistence & Restoration**: Saves and recovers open tabs, zoom levels, viewports, and active layers in a backing session index.
- **State Isolation**: Switching tabs swaps out the entire editor context, including elements, connectors, selections, zoom levels, active layers, and transaction histories.
- **Productivity Controls**: Tabs support drag-and-drop reordering, middle-click to close, "Close Others", and "Close All" command shortcuts.
- **Dirty State Indicator**: A bullet dot icon indicates unsaved progress in the tab title header.
- **Reopen buffer**: Remembers closed tabs and allows quick recovery (`Ctrl+Shift+T`).

---

### 4.16 Command Palette & Floating Toolbar

Designed for keyboard-centric and mouse-centric velocity:
- **Fuzzy Search Command Palette (`Ctrl+Shift+P`)**: Search system actions, shapes, layers, and templates. Includes character-scoring fuzzy matching and prefix filters:
  - `>` for editor commands
  - `@` for canvas elements (centers viewport on that element)
  - `/` for inserting shapes directly at canvas center
  - `#` for layer selection
- **Recently Used Tracking**: Displays the last 5 executed commands at the top of the palette.
- **Floating Contextual Toolbar**: Renders above selected elements. Features smart viewport alignment, screen panel collision boundaries, and vertical flip logic. Houses essential style/action controls (Fill/Stroke colors, Alignment, Grouping, Locking, Layer reassignment).

---

## 6. Plugin System

The application includes a **plugin architecture** so functionality can be extended without modifying core code:

- Plugins access the canvas through a controlled `EditorAPI` (read elements, add elements, update elements)
- **GridGeneratorPlugin** is included as a working example — generates a 3×3 grid layout automatically
- Plugins are toggled on/off from the Settings → Plugins tab
- Future plugins could include: auto-layout algorithms, database schema importers, Confluence/Jira integration, and more

---

## 7. Technical Architecture (Summary)

The application is built in **layers** that are cleanly separated:

```
┌─────────────────────────────────────────────────┐
│  Desktop Shell (Electron)                        │
│  Native OS file dialogs, menus, IPC security    │
├─────────────────────────────────────────────────┤
│  UI Layer (React + Tailwind)                     │
│  Toolbar, Sidebar, Properties Panel, Dialogs    │
├─────────────────────────────────────────────────┤
│  Canvas Engine (Custom HTML5 Canvas 2D)          │
│  60fps render loop, hit-testing, shapes         │
├─────────────────────────────────────────────────┤
│  Editor Logic Layer                              │
│  Commands, Undo/Redo, Transactions              │
├─────────────────────────────────────────────────┤
│  State Management (17 Zustand stores)            │
│  Elements, Selection, Interaction, Settings…    │
├─────────────────────────────────────────────────┤
│  Storage Layer                                   │
│  Autosave, File I/O, Recovery, Recent Projects  │
└─────────────────────────────────────────────────┘
```

**Why this architecture?**
- **No external servers** — everything runs locally on the user's machine
- **Security** — Electron's context isolation prevents any renderer code from accessing the OS directly
- **Performance** — the rendering engine reads state without triggering React re-renders (60fps guaranteed)
- **Testability** — each layer is independently testable; the Command pattern makes state changes predictable

---

## 8. Technology Choices

| Technology | Why Chosen |
|---|---|
| **Electron** | Cross-platform native desktop with web technologies; large ecosystem |
| **React 18** | Mature component model; concurrent features available |
| **TypeScript** | Type safety catches bugs at compile time; excellent IDE support |
| **Vite 6** | Fast build and hot-reload during development |
| **Tailwind CSS** | Utility-first styling; consistent design tokens via CSS variables |
| **Zustand 5** | Lightweight, no-boilerplate state management; works outside React (critical for 60fps render loop) |
| **Custom Canvas Engine** | Third-party canvas libraries add weight and constraints; a custom engine gives full control over performance |

---

## 9. Current Status

| Area | Status |
|---|---|
| Canvas rendering engine | ✅ Production-ready (60fps, culling, HiDPI) |
| Shape library (165+ shapes) | ✅ Complete |
| Inline text editing | ✅ Working (double-click, scrollbar-free) |
| Resize handles (8-point) | ✅ Working with undo/redo |
| Undo/Redo system | ✅ 50-step command history |
| Connector system | ✅ Functional (straight, orthogonal, and curved Bezier routing) |
| Freehand drawing tool | ✅ Complete (smooth vector draw, scaling, SVG export) |
| Properties panel | ✅ All 6 sections working |
| Settings dialog (all 4 tabs) | ✅ All tabs functional and wired to stores |
| Scratchpad feature | ✅ Persisted to localStorage |
| Export (PNG / SVG / PDF) | ✅ Working (with high-DPI custom shape rasterization fallback) |
| File save / open | ✅ Working via native dialogs |
| Autosave + recovery | ✅ Working |
| Layer system | ✅ Working |
| Plugin system | ✅ Architecture in place + example plugin |
| Theme system (Dark/Light) | ✅ Live-switching |
| Template system & Welcome screen | ✅ Complete (7 categories, previews, and cloning) |
| Multi-Document tabbed workspace | ✅ Complete (session restore, isolated state, workspace management) |
| Command Palette & Floating Toolbar | ✅ Complete (fuzzy search, prefix query modes, context-aware floating controls) |

---

## 10. Potential Future Enhancements

1. **Anchor-point snapping** — precise connection points on each shape side
2. **Cloud sync** — save diagrams to OneDrive / Google Drive
3. **Real-time collaboration** — multi-user diagram editing via WebSocket
4. **Enhanced Connection-Line Styling** — dashes, customize thickness, and specialized start/end shapes
5. **More plugins** — auto-layout, database import, export to Confluence
6. **Diagram versioning** — track changes over time with named versions

---

## 11. Summary

NodeForge is a **complete, fully functional** offline diagramming tool built entirely in-house. It matches the core feature set of commercial tools like Visio and Lucidchart, with a modern and professional UI, high-performance 60fps rendering, 165+ built-in shapes, full undo/redo, file save/open, export to PNG/SVG/PDF, and an extensible plugin system.

The codebase is clean, modular, well-typed, and architected for long-term maintainability and future feature additions.

---

*Document generated from full project source audit — May 2026*
