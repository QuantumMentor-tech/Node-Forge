# NodeForge — Professional Diagramming Application

![Electron](https://img.shields.io/badge/Electron-33.0-47848f?logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.0-646cff?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5.0-orange)

---

## 🚀 Quick Start

### **Run the Application (Windows)**

Simply **double-click one of these batch files:**
- **`also install electron before runing this project
- **`run.bat`** — Start the app immediately (recommended for first-time users)
- **`start.bat`** — Interactive menu with more options
- **`build.bat`** — Compile code only
- **`package.bat`** — Create a Windows installer (.exe)
- **`install.bat`** — Install dependencies only

**Requirements:**
- Windows operating system
- Node.js v16+ ([Download here](https://nodejs.org/))

**First-time setup:**
```batch
run.bat
```
The script will automatically install dependencies and launch the application.

For more detailed instructions, see [RUN_APP.md](RUN_APP.md).

---

## 🌟 Overview

**NodeForge** is a production-grade, fully offline desktop diagramming application. Built on Electron + React with a completely custom HTML5 Canvas rendering pipeline, it delivers a native-feeling, high-performance workspace for creating flowcharts, UML diagrams, ER diagrams, network diagrams, and any other visual diagram — without requiring an internet connection.

The application is architected around three core principles:
- **Performance** — 60 fps render loop with viewport culling, direct mutation during drag, and module-level constants to eliminate per-frame allocations
- **Reliability** — Command pattern undo/redo, autosave, crash recovery, and strongly-typed TypeScript throughout
- **Extensibility** — Plugin API, modular shape registry, and atomic Zustand store architecture

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Desktop Runtime | Electron 33 |
| Frontend Framework | React 18.3 + Vite 6 |
| Language | TypeScript 5.7 (strict mode) |
| Styling | Tailwind CSS 3.4 + CSS Variables |
| State Management | Zustand 5 (17 atomic stores) |
| Rendering Engine | Custom HTML5 Canvas 2D Pipeline |
| Export | jsPDF 4, svg2pdf.js 2 |
| Build Tool | Vite + vite-plugin-electron |

---

## ✨ Core Features

### 🖼️ Canvas Engine
- **Infinite workspace** — pan with middle mouse / Space+drag, zoom with Ctrl+wheel or toolbar
- **60 fps render loop** — `requestAnimationFrame` driven with `getState()` reads (no React re-renders in the hot path)
- **Viewport culling** — elements outside the view (+20% margin) are skipped each frame
- **Retina / HiDPI** — `devicePixelRatio` scaling for crisp rendering on all displays
- **Coordinate system** — screen↔world transform utilities for pixel-perfect hit testing
- **Grid** — configurable dot/line grid with snap-to-grid support

### 🔷 Shape Library — 165+ Shapes across 8 Categories

| Category | Count | Highlights |
|---|---|---|
| Basic Shapes | 23 | Rectangle, ellipse, diamond, star, crescent, heart, callout, smiley |
| General | 14 | Sticky note, shield, badge, tag, hourglass, double callout |
| Flowchart | 22 | Process, decision, database, cloud, document, multi-document, display |
| Arrows | 20 | Block arrows (all directions), chevron, 4-way, U-turn, curved, paper plane |
| Advanced | 6 | Table, list box, card, frame, person/avatar, data grid |
| Misc | 15 | Gear, play button, line variants, table headers, text labels |
| UML | 23 | Class, interface, package, actor, state machine, lifeline, sequence |
| Entity Relation | 15 | Entity, attribute, relationship, all Crow's Foot notation lines |

### ✏️ Editing
- **Drag-and-drop** from sidebar → canvas (places at drop point)
- **Click-to-add** — single click on shape in sidebar places it at viewport center
- **Inline text editing** — double-click any shape to open a floating textarea overlay; `Enter` commits, `Escape` cancels
- **Multi-select** — `Shift+click` or marquee drag (box selection)
- **Move** — drag selected elements; multi-element moves maintain relative positions
- **Resize** — 8-handle resize (4 corners + 4 edge midpoints) with directional cursors and 10px minimum size clamp
- **Rotate** — set rotation angle via the Properties panel
- **Z-ordering** — Bring to Front / Forward / Backward / Back

### ✍️ Freehand Drawing
- **Freehand tool** — press `P` or select the Freehand Tool from the toolbar to draw custom freehand vector shapes
- **Vector rendering & export** — freehand shapes are rendered smoothly using cubic Beziers, support resizing, rotation, and export to clean vector SVG paths

### 🔌 Connectors
- Draw connections by selecting the Arrow/Line tool then clicking a source element
- Supports `straight`, `orthogonal`, and **`curved` (Bezier)** routing types
- Figma-style organic curved S-routing depending on placement vectors
- Anchor-point snapping with Crow's Foot / arrowhead options, with arrowheads correctly aligning to curves
- Connectors cascade-delete when their endpoint element is deleted
- Sampling-based hit testing for pixel-perfect hover selection of curved connectors

### ↩️ History — Undo / Redo
Full **Command Pattern** implementation:
- `CreateElementCommand`, `DeleteElementsCommand`, `MoveElementsCommand`, `UpdateElementCommand`, `ReorderElementsCommand`, `CreateConnectorCommand`, `DeleteConnectorCommand`
- **Transaction batching** — multiple commands grouped as a single undo step
- `Ctrl+Z` / `Ctrl+Y` (up to 50 history steps)

### 📋 Clipboard
- `Ctrl+C` Copy, `Ctrl+X` Cut, `Ctrl+V` Paste
- Paste offsets elements by +20px to avoid overlap
- Connector IDs are remapped so paste preserves linked shapes

### 🗂️ Layers
- Multiple named layers per diagram
- Show / hide layers (hidden layers excluded from rendering and hit-testing)
- Lock layers to prevent accidental edits
- Active layer selector for placing new elements

### 🎨 Properties Panel (right panel)
| Section | Controls |
|---|---|
| Layout | X, Y, Width, Height, Rotation, Opacity; multi-element alignment |
| Text | Font size, Left/Center/Right alignment |
| Fill | Color swatch + hex input |
| Stroke | Color swatch + hex input + width |
| Text Color | Color swatch + hex input |

All changes are **undoable** (pushed through `EditorActions` → `UpdateElementCommand`).

### 📌 Scratchpad
- Pin any selected canvas element to the sidebar scratchpad with the `+` button
- Drag pinned items back to the canvas — placed at drop position with a fresh ID
- Rename items inline (click pencil icon)
- Persisted to `localStorage` across sessions

### 📂 Template System & Onboarding
- **Welcome Onboarding Screen**: Automatically launches when no files are open, allowing users to start fresh or clone starter templates.
- **7 Professional Starter Kits**: Fully-structured diagram setups for Flowcharts, UML, Entity Relationship Diagrams, AWS Architectures, Network Diagrams, Org Charts, and Mind Maps.
- **Interactive Preview & Search**: Hovering templates displays descriptive metadata and diagram layout bounds; built-in search filters available kits.
- **Direct Template Cloning**: Instantly instantiates a new isolated workspace tab populated with the selected template's vector shapes and connections.

### 🗂️ Multi-Document Tab Workspaces
- **Isolated Workspace Tabs**: Supports editing multiple diagrams concurrently in VS Code-style tabs.
- **Full State Isolation**: Each tab maintains its own isolated canvas elements, connectors, viewport zoom/pan coordinates, selection boundaries, active layer indexes, and undo/redo transaction history.
- **Tab Session Persistence**: Autosaves the list of open tabs and editor contexts to a local session, restoring them seamlessly on application restart.
- **Productivity Options**: Supports drag-and-drop tab reordering, middle-click close, "Close Others", and "Close All" command actions.
- **Reopen Buffer**: Remembers closed tabs and allows quick recovery via `Ctrl+Shift+T`.
- **Unsaved State Indicators**: Highlights dirty tabs with a visual bullet dot indicator in the header.

### ⌨️ Command Palette & Contextual Quick Actions
- **Fuzzy Search Command Palette (`Ctrl+Shift+P`)**: Search and execute commands, select layers, view templates, or find shapes. Features prefix query filters:
  - `>` filters to editor commands
  - `@` filters to canvas elements (centers camera viewport on that element)
  - `/` inserts shape definitions directly at center of current view
  - `#` switches the active layer
- **Recently Used Tracking**: Displays the last 5 executed commands at the top of the palette.
- **Floating Contextual Toolbar**: Selection-aware toolbar that renders directly above the active elements. 
  - *Viewport-aware positioning*: Centered horizontally above selection bounds, flips below if clearance is restricted, and clamps to sidebar bounds to prevent clipping.
  - *Direct adjustments*: Fill/Stroke colors, Alignment (Left/Center/Right), Group/Ungroup, Lock/Unlock toggling, and Layer reassignment.

### ⚙️ Settings Dialog (4 tabs)
| Tab | Features |
|---|---|
| Editor | Theme (Dark / Light / System — live apply), Autosave toggle, Show Grid toggle, Snap to Grid toggle |
| Storage | localStorage usage breakdown per key, Clear Diagram Data action |
| Performance | High Quality Rendering toggle, rendering engine info |
| Plugins | Enable / disable installed plugins with toggle switches |

### 💾 File Operations
- **Save** — exports diagram as `.drawio.json` via native OS file dialog
- **Open** — imports `.drawio.json`; validates schema before loading
- **Autosave** — saves to `localStorage` every 60 seconds when enabled
- **Recovery** — detects unsaved work from previous session on startup; offers to restore
- **Recent Projects** — tracks last 10 opened files

### 📤 Export
| Format | Engine |
|---|---|
| PNG | Canvas `toDataURL()` at 2× pixel density |
| SVG | Custom `SVGRenderer` — outputs vector paths + high-DPI (3x) rasterized fallback images for custom shapes |
| PDF | jsPDF + svg2pdf.js |

### ⌨️ Keyboard Shortcuts
| Action | Shortcut |
|---|---|
| Undo / Redo | `Ctrl+Z` / `Ctrl+Y` |
| Copy / Cut / Paste | `Ctrl+C` / `Ctrl+X` / `Ctrl+V` |
| Select All | `Ctrl+A` |
| Duplicate | `Ctrl+D` |
| Delete | `Delete` / `Backspace` |
| Group / Ungroup | `Ctrl+G` / `Ctrl+Shift+G` |
| Zoom In / Out | `Ctrl++` / `Ctrl+-` |
| Fit to Screen | `Ctrl+Shift+H` |
| Move (nudge) | Arrow keys (1px), `Shift+Arrow` (10px) |
| Bring to Front / Back | `]` / `[` |
| Pan canvas | `Space+drag` or middle mouse |
| Command Palette | `Ctrl+Shift+P` |
| Switch Workspace Tabs | `Ctrl+Tab` / `Ctrl+Shift+Tab` |
| Reopen Last Closed Tab | `Ctrl+Shift+T` |

### 🧩 Plugin System
- `EditorAPI` exposes canvas read/write access to plugins
- `PluginManager` handles activate / deactivate lifecycle
- **GridGeneratorPlugin** (built-in example) — generates a 3×3 grid layout

---

## 🏛️ Architecture

```
src/
├── App.tsx                    # Root: theme init + settings sync
├── main.tsx                   # Registry init → React mount
│
├── canvas/
│   ├── CanvasEngine.tsx       # React wrapper: render loop + drag/drop
│   ├── InteractionManager.ts  # Mouse/wheel → state machine (IDLE/MOVING/DRAWING/RESIZING/…)
│   ├── GridRenderer.ts        # Grid dot/line rendering
│   └── renderer/
│       ├── ShapeRenderer.ts   # Shape dispatch + generic label draw
│       ├── SelectionRenderer.ts # Selection outline + 8 resize handles
│       └── ConnectorRenderer.ts # Connector routing + arrowheads
│
├── editor/
│   ├── EditorActions.ts       # Public API for ALL mutations (single entry point)
│   ├── CommandManager.ts      # Undo/redo stack (max 50)
│   ├── TransactionManager.ts  # Batch multiple commands into one undo step
│   ├── ToolManager.ts         # Active tool state
│   └── commands/              # 9 concrete Command implementations
│
├── shapes/
│   ├── core/ShapeRegistry.ts  # Central shape registration + getCategories()
│   ├── index.ts               # initializeShapeRegistry()
│   └── packs/                 # 8 shape pack files (165+ definitions)
│
├── stores/                    # 17 Zustand atomic stores
│   ├── canvas.store.ts        # Elements, connectors, viewport, grid
│   ├── selection.store.ts     # Selected IDs
│   ├── interaction.store.ts   # Phase machine (IDLE/MOVING/RESIZING/…)
│   ├── editor.store.ts        # Mode (select/draw/pan), active tool
│   ├── settings.store.ts      # User preferences (persisted)
│   ├── theme.store.ts         # Dark/Light/System theme
│   ├── layer.store.ts         # Layer definitions + active layer
│   ├── scratchpad.store.ts    # Pinned elements (persisted)
│   └── …(9 more)
│
├── components/
│   ├── layout/                # AppShell, Sidebar, Toolbar, PropertiesPanel, StatusBar, CanvasArea
│   ├── dialogs/               # SettingsDialog, ExportDialog, RecoveryBanner
│   └── ui/                    # InlineEditor, Minimap, ContextMenu, Toast, …
│
├── storage/
│   ├── AutosaveManager.ts     # 60s interval save to localStorage
│   ├── RecoveryManager.ts     # Session recovery on startup
│   ├── ProjectSerializer.ts   # Diagram JSON schema
│   └── FileOperations.ts      # Native file open/save via Electron IPC
│
├── export/
│   ├── ExportEngine.ts        # Format dispatch (PNG/SVG/PDF)
│   └── SVGRenderer.ts         # Canvas shapes → SVG paths
│
├── plugins/
│   ├── PluginManager.ts       # Activate/deactivate lifecycle
│   ├── EditorAPI.ts           # Plugin-facing read/write API
│   └── GridGeneratorPlugin.ts # Example built-in plugin
│
├── utils/                     # coordinates, anchors, routing, geometry, element.factory
├── hooks/                     # useKeyboardShortcuts, useMenuEvents
├── themes/                    # CSS variable theme definitions
└── types/                     # Shared TypeScript interfaces
```

---

## 🚀 Getting Started

### Prerequisites
- **Windows** operating system
- **Node.js** ≥ v16 ([Download from nodejs.org](https://nodejs.org/))
- **npm** (comes with Node.js)

### Easy Setup (Recommended)

**Option 1: Double-Click to Run**
1. Open the project folder
2. Double-click **`run.bat`**
3. Wait for the app to launch (~30-60 seconds on first run)

**Option 2: Interactive Menu**
1. Double-click **`start.bat`**
2. Choose from the menu:
   - `[1]` Run Application
   - `[2]` Build Project
   - `[3]` Create Installer
   - `[4]` Install Dependencies
   - `[5]` Open in Explorer
   - `[6]` Exit

**Option 3: Command Line**
```bash
cd "g:\Latest Working Projects\Nodeforge V 5.1.0\Draw.io"
npm install        # First time only
npm run electron:dev
```

### Available Batch Files

| File | Purpose |
|------|---------|
| **`run.bat`** | Run the application immediately |
| **`start.bat`** | Interactive menu with options |
| **`build.bat`** | Build/compile code only |
| **`package.bat`** | Create Windows installer (.exe) |
| **`install.bat`** | Install/update dependencies |

### Build Commands
```bash
npm run dev          # Web development server (Vite)
npm run build        # Compile + bundle
npm run electron:dev # Run as Electron app
npm run package      # Create Windows installer
```

For detailed setup and troubleshooting, see [RUN_APP.md](RUN_APP.md).

---

## 🔒 Security

- **Context Isolation** enabled — renderer process has no Node.js access
- **Sandbox** mode active for renderer
- **Preload bridge** (`preload.ts`) exposes only a typed, minimal IPC surface
- **No `nodeIntegration`** — all Node APIs accessed via controlled IPC channels

---

## 📁 Project Info

| Field | Value |
|---|---|
| Project Name | NodeForge |
| Version | 1.0.0 |
| License | MIT |
| Electron | 33.3.1 |
| React | 18.3.1 |
| TypeScript | 5.7.3 |
| Shape Count | 165+ |
| Store Count | 19 Zustand stores |
| Command Types | 9 undoable commands |
