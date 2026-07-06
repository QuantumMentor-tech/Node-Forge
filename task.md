# NodeForge Fix & Feature Task List

All planned bugs have been fixed and all features have been successfully implemented.

---

## 🚀 How to Run NodeForge

**Quick start (Windows):**
```batch
run.bat
```

**Or manually:**
```bash
npm install
npm run electron:dev
```

**Batch files available:**
- `run.bat` — Run app
- `start.bat` — Menu
- `build.bat` — Build
- `package.bat` — Create installer
- `install.bat` — Install dependencies

See [RUN_APP.md](RUN_APP.md) for full details.

---

## Phase 1 — Quick Wins
- [x] Add missing Tailwind keyframes (slideInDown, slideInBottom)
- [x] Fix duplicate sep2 id in CanvasArea.tsx
- [x] Fix SchemaMigration format stamp
- [x] Rename RecentProjectsManager localStorage key
- [x] Fix window titles in file.store.ts
- [x] Fix window titles in FileActions.ts
- [x] Fix SettingsDialog Clear Data keys
- [x] Fix InlineEditor label comparison
- [x] Fix StatusBar platform symbols
- [x] Remove dead 'xml' ExportFormat

## Phase 2 — Branding & Storage
- [x] Align file extension / format across schema files
- [x] Update file.handler.ts dialog filters

## Phase 3 — Medium Bug Fixes
- [x] Fix zoom desync (ZoomStore.level vs viewport.zoom)
- [x] Make CommandManager.pushToUndoStack public
- [x] Fix InteractionManager as-any cast
- [x] Fix EditorAPI.shapes.add() bypass CommandManager
- [x] Fix element.factory.ts hardcoded dark strokeColor
- [x] Fix SVGRenderer context-stroke arrowhead
- [x] Extract Minimap bounds calculation helper
- [x] Add ConfirmDialog (replace window.confirm)
- [x] Implement fitToScreen()
- [x] Fix Toolbar ellipse shortcut label

## Phase 4 — Connector & Layer UI
- [x] Add UpdateConnectorCommand
- [x] Add EditorActions.updateConnector()
- [x] Add Connector section to PropertiesPanel
- [x] Add Layers tab to Sidebar

## Phase 5 — Drawing & Routing
- [x] Implement freehand FSM in InteractionManager
- [x] Add freehand renderer in ShapeRenderer
- [x] Add freehand SVG export
- [x] Implement Bezier curved connectors in routing.ts
- [x] Update ConnectorRenderer for curves

## Phase 6 — SVG Export All Shapes
- [x] SVGRenderer: OffscreenCanvas approach for all shapes
- [x] SVGRenderer: fix arrowhead marker

## Phase 7 — CommandPalette Integration
- [x] Drive CommandPalette from ShortcutRegistry

## Phase 8 — Native Menu, Lock Constraints, Resize Cursors, and Branding
- [x] Implement Native Menu integration in `useMenuEvents.ts`
- [x] Add `menu:export` to open the export dialog
- [x] Add `menu:about` to trigger the branded about toast
- [x] Add Lock Guards and Hover Cursors to `InteractionManager.ts`
- [x] Add `!selEl.locked` check to prevent resizing locked elements
- [x] Add `if (el.locked) return` inside `moveElementAndChildren` to prevent dragging locked elements
- [x] Implement dynamic resize cursors on hover for selection handles in `IDLE` / `SELECTING` phases
- [x] Align Drag-and-Drop MIME types to `nodeforge-*`
