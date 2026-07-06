# NodeForge - Comprehensive Project Audit

This document presents an "A to Z" scan and audit of the **NodeForge** project. It outlines the technology stack, detailed project architecture, implemented components, and the current development status based on the codebase analysis.

> [!NOTE]
> **Project Overview**
> NodeForge is an in-development, professional, offline-first diagramming and whiteboard application. It utilizes a secure Electron environment for desktop capabilities and a high-performance custom HTML5 Canvas rendering pipeline in React.

---

## 🚀 Quick Start

To run the application on **Windows**:

```batch
# Option 1: Double-click this file
run.bat

# Option 2: Command line
npm install
npm run electron:dev
```

**Batch Files Available:**
- `run.bat` — Start the app immediately
- `start.bat` — Interactive menu
- `build.bat` — Build only
- `package.bat` — Create Windows installer
- `install.bat` — Install dependencies

See [RUN_APP.md](RUN_APP.md) for detailed setup and troubleshooting.

---

The application is built on a modern and robust stack:
* **Core Framework**: Electron (v33) for native desktop integration, separating Main and Renderer processes.
* **Frontend UI**: React 18 with Vite as the build tool and development server.
* **Language**: TypeScript (Strict mode) for comprehensive type safety.
* **Styling**: Tailwind CSS combined with Custom CSS Variables for light/dark theming.
* **State Management**: Zustand, featuring an atomic store architecture to prevent unnecessary global re-renders.
* **Rendering Engine**: Custom-built HTML5 Canvas Pipeline engineered for high performance (infinite panning, precise zooming).
* **Icons**: `lucide-react` for consistent UI iconography.

---

## 📂 Project Structure & Architecture

The codebase is logically divided into three primary domains: `electron` (Main process), `shared` (IPC definitions), and `src` (Renderer process).

### 1. `electron/` (Main Process)
Handles the OS-level interactions, window management, and secure communication.
* **`main.ts`**: The entry point for Electron. Manages window lifecycle and native menus.
* **`preload.ts`**: The secure Context Bridge exposing allowed APIs to the renderer.
* **`ipc/`**: Inter-Process Communication handlers.
  * `app.handler.ts`: Manages application-level native events.
  * `file.handler.ts`: Handles native file system operations (Save/Load dialogues).

### 2. `shared/`
* **`types.ts`**: Contains types and interfaces shared between the Node.js main process and the React renderer, ensuring IPC payloads are strictly typed.

### 3. `src/` (Renderer Process)
The core frontend application, containing the React UI and the Canvas engine.

#### 🎨 Canvas Engine (`src/canvas/`)
The heavy lifter for diagramming operations.
* **`CanvasEngine.tsx`**: The main React component wrapping the HTML5 `<canvas>`.
* **`InteractionManager.ts`**: Manages complex mouse/touch events, panning, zooming, and tool states.
* **`GridRenderer.ts`**: Renders the infinite scalable dot-grid background using modulo arithmetic.
* **`renderer/`**: Isolated renderers for specific layers.
  * `ShapeRenderer.ts`: Draws individual shapes and nodes.
  * `SelectionRenderer.ts`: Handles the drawing of selection bounding boxes and resize handles.
  * `ConnectorRenderer.ts`: Renders lines and arrows between shapes.

#### 🧩 UI Components (`src/components/`)
Modular, reusable UI elements.
* **Layouts (`layout/`)**: `AppShell.tsx`, `Toolbar.tsx`, `Sidebar.tsx`, `PropertiesPanel.tsx`, `StatusBar.tsx`, `CanvasArea.tsx`.
* **Base UI (`ui/`)**: Reusable atomic elements like `Button.tsx`, `IconButton.tsx`, `Panel.tsx`, `Separator.tsx`, and `Tooltip.tsx`.
* **Diagram Elements (`nodes/`, `connectors/`, `editor/`)**: Placeholder directories structured for specific shape logic.

#### 🧠 State Management (`src/stores/`)
Zustand stores meticulously separated by domain to maintain 60FPS performance.
* `canvas.store.ts`: Core canvas state (shapes, connectors, dimensions).
* `zoom.store.ts`: Viewport translation and scale state.
* `selection.store.ts`: Currently selected nodes/edges.
* `editor.store.ts`: Active tool (pointer, rectangle, etc.) and global editor state.
* `theme.store.ts`: Application visual theme (dark/light).
* `file.store.ts`: Metadata regarding the currently open file.
* `history.store.ts`: Undo/Redo stack management.
* `workspace.store.ts`: Multi-document tab workspaces and state isolation.
* `template.store.ts`: Template onboarding and category state.

#### 📐 Math & Utilities (`src/utils/`)
* **`geometry.ts` / `coordinates.ts`**: Functions for bounding box calculations, intersection detection, and viewport-to-world coordinate mapping.
* **`anchors.ts` / `routing.ts`**: Logic for determining where connectors attach to shapes and how lines route around obstacles.
* **`element.factory.ts`**: Factory patterns for generating new shape data objects.
* **`builtinTemplates.ts`**: Starter dataset definitions for flowchart, UML, ER, AWS, Network, Org Chart, and Mind Map categories.

#### 🏷️ Type Definitions (`src/types/`)
* Domain-specific TypeScript definitions separated into `canvas.types.ts`, `editor.types.ts`, and `ui.types.ts`.

---

## 🚦 Current Status & Roadmap

> [!TIP]
> **Codebase Health**
> The project exhibits an exceptionally clean architectural design. The separation of concerns (Canvas logic vs. React UI vs. Main Process) is perfectly aligned with modern professional Electron development. 

### Completed Foundations
- ✅ Electron boilerplate with Vite integration.
- ✅ Secure IPC communication via `preload.ts`.
- ✅ Complete UI App Shell with Dark/Light mode scaling.
- ✅ High-performance Canvas rendering loop with separated interaction and drawing phases.
- ✅ Atomic state architecture using Zustand.
- ✅ File System Integration: Complete saving/loading of `.drawio.json` files and autosave/crash recovery.
- ✅ Properties Panel Syncing: Complete editing of properties, text labels, colors, and layouts.
- ✅ Command Pattern History: Robust 50-step undo/redo stack with compound transaction batching.
- ✅ Custom Shape Registry: 165+ shapes populated across UML, Flowchart, ER, and general categories.
- ✅ Scratchpad: Sidebar drawer for pinning and dragging custom elements to/from the canvas.
- ✅ Advanced routing: Straight, orthogonal, and **curved cubic Bezier** connector routing.
- ✅ Freehand tool: Direct vector brush drawing with point rescaling and vector exporting.
- ✅ Command Palette: Centralized command registry with VS Code-style fuzzy search, prefix-based sub-queries (`>`, `@`, `/`, `#`), and recently used items.
- ✅ Contextual Floating Toolbar: Selection-aware toolbar with smart viewport positioning, flip logic, fill/stroke colors, z-index, alignment, and grouping controls.
- ✅ Multi-Document Tab Workspaces: Full workspace state isolation (canvas, selection, viewport, undo/redo, layers) supporting drag-reordering, middle-click close, and persistent user sessions.
- ✅ Built-in Template Library & Welcome Screen: Categorized starter diagrams, searchable previews, and direct cloning engine.
- ✅ High-DPI SVG Export: Recreates elements as clean vector paths and applies a 3x resolution canvas rasterization fallback for advanced custom shapes.

## 🚦 Roadmap & Future Enhancements
1. **Anchor-point Snapping**: Fine-grained connection anchors on custom shape edges.
2. **Layer Panel Enhancements**: Full UI controls in the sidebar layer list.
3. **Collaboration Sync**: Multi-user editing over a local network or server.

