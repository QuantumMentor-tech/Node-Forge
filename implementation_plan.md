# NodeForge — Full Fix & Feature Implementation Plan

> [!IMPORTANT]
> This touches ~35 source files. Each phase is self-contained and can be verified independently before moving to the next.

---

## 🚀 Quick Start (Before Making Changes)

To run and test NodeForge:

**Option 1: Double-click batch file**
```batch
run.bat
```

**Option 2: Command line**
```bash
npm install
npm run electron:dev
```

For details, see [RUN_APP.md](RUN_APP.md).

---

## Overview

Fixing all **25 bugs** found in the audit + implementing all **missing features** identified. Work is grouped into 6 phases ordered by impact and dependency.

---

## Phase 1 — Quick Wins (Low-risk, High-impact) `~20 min`

These are small, isolated fixes with no cross-file dependencies.

### [MODIFY] [tailwind.config.ts](file:///D:/Working%20Projects/Draw.io/tailwind.config.ts)
- **Add missing animation keyframes**: `slideInDown` and `slideInBottom`
- Fixes broken `CommandPalette` entrance animation and `Toast` slide-in animation

### [MODIFY] [CanvasArea.tsx](file:///D:/Working%20Projects/Draw.io/src/components/layout/CanvasArea.tsx)
- **Fix duplicate `sep2` id** → rename second separator to `sep3`

### [MODIFY] [SchemaMigration.ts](file:///D:/Working%20Projects/Draw.io/src/storage/schema/SchemaMigration.ts)
- **Fix format stamp**: change `'drawio-desktop'` → `'nodeforge'`

### [MODIFY] [RecentProjectsManager.ts](file:///D:/Working%20Projects/Draw.io/src/storage/RecentProjectsManager.ts)
- **Rename localStorage key**: `'drawio_recent_projects'` → `'nodeforge_recent_projects'`

### [MODIFY] [file.store.ts](file:///D:/Working%20Projects/Draw.io/src/stores/file.store.ts)
- **Fix window title**: `'Draw.io Desktop'` → `'NodeForge'`

### [MODIFY] [FileActions.ts](file:///D:/Working%20Projects/Draw.io/src/file/FileActions.ts)
- **Fix all 5 window title strings**: `'Draw.io Desktop'` → `'NodeForge'`

### [MODIFY] [SettingsDialog.tsx](file:///D:/Working%20Projects/Draw.io/src/components/dialogs/SettingsDialog.tsx)
- **Fix Clear Data storage keys**: `'drawio_settings'` → `'nodeforge_settings'`, `'drawio-scratchpad-v1'` → `'nodeforge-scratchpad-v1'`

### [MODIFY] [InlineEditor.tsx](file:///D:/Working%20Projects/Draw.io/src/components/ui/InlineEditor.tsx)
- **Fix label comparison**: `el.label !== value` → `(el.label ?? '') !== value`

### [MODIFY] [StatusBar.tsx](file:///D:/Working%20Projects/Draw.io/src/components/layout/StatusBar.tsx)
- **Fix platform symbols**: replace `⌘Z`/`⌘Y` with `Ctrl+Z`/`Ctrl+Y` (or detect platform via `window.electronAPI.platform`)

### [MODIFY] [editor.types.ts](file:///D:/Working%20Projects/Draw.io/src/types/editor.types.ts)
- **Remove dead `'xml'` from `ExportFormat`** union type

---

## Phase 2 — Branding & Storage Key Migration `~10 min`

Consolidate all old `drawio_*` references.

### Files touched:
- `settings.store.ts` — verify `nodeforge_settings` key (already correct, confirm)
- `scratchpad.store.ts` — verify `nodeforge-scratchpad-v1` key (already correct, confirm)
- `file.handler.ts` — `defaultPath: 'untitled.drawio'` → keep `.nodeforge` extension consistent
- `ProjectSchema.ts` — `PROJECT_FILE_EXTENSION = '.drawio'` → change to `'.nodeforge'`
- `file.handler.ts` — filter extensions: add `nodeforge` alongside `drawio`

---

## Phase 3 — Bug Fixes (Medium complexity) `~45 min`

### [MODIFY] [tailwind.config.ts](file:///D:/Working%20Projects/Draw.io/tailwind.config.ts) *(already in Phase 1)*

### [MODIFY] [zoom.store.ts](file:///D:/Working%20Projects/Draw.io/src/stores/zoom.store.ts)
- **Fix zoom desync**: `zoomIn()` and `zoomOut()` must also update `canvas.store.viewport.zoom` — or remove the duplicate `level` field and use `viewport.zoom` as the single source of truth

### [MODIFY] [CommandManager.ts](file:///D:/Working%20Projects/Draw.io/src/editor/CommandManager.ts)
- **Expose `pushToUndoStack` publicly**: change from private to a proper public method so `InteractionManager` can call it without `as any` cast

### [MODIFY] [InteractionManager.ts](file:///D:/Working%20Projects/Draw.io/src/canvas/InteractionManager.ts)
- **Remove `(manager as any)` cast**: use the now-public `pushToUndoStack` method

### [MODIFY] [EditorAPI.ts](file:///D:/Working%20Projects/Draw.io/src/plugins/EditorAPI.ts)
- **Fix plugin `shapes.add()` bypass**: wrap `addElement` in `CreateElementCommand` so plugin-created shapes have undo entries

### [MODIFY] [element.factory.ts](file:///D:/Working%20Projects/Draw.io/src/utils/element.factory.ts)
- **Fix hardcoded dark stroke**: read current theme from `useThemeStore` or use a CSS-var-aware neutral default (`'var(--color-border-strong)'`)

### [MODIFY] [SVGRenderer.ts](file:///D:/Working%20Projects/Draw.io/src/export/SVGRenderer.ts)
- **Fix `fill="context-stroke"` arrowhead marker**: replace with explicit `fill="inherit"` or pass stroke color as a parameter

### [MODIFY] [Minimap.tsx](file:///D:/Working%20Projects/Draw.io/src/components/ui/Minimap.tsx)
- **Extract duplicated bounds-calculation**: move `minX/Y/maxX/Y` logic into shared `getElementsBounds()` helper used by both `useEffect` and `updateViewport()`

### [NEW] Confirm/Unsaved Dialog component
- **Replace `window.confirm()`** in `FileActions.ts` with a proper React modal: `ConfirmDialog.tsx`
- Add `useConfirmStore` (open/close + resolve promise pattern)

### [MODIFY] [zoom.store.ts](file:///D:/Working%20Projects/Draw.io/src/stores/zoom.store.ts)
- **Implement `fitToScreen()`**: calculate bounding box of all elements, compute zoom level and pan offset to fit viewport

### [MODIFY] [Toolbar.tsx](file:///D:/Working%20Projects/Draw.io/src/components/layout/Toolbar.tsx)
- **Fix ellipse shortcut label**: tooltip shows `O` but registry has `E` — align to `E`

### [MODIFY] [ShortcutRegistry.ts](file:///D:/Working%20Projects/Draw.io/src/shortcuts/ShortcutRegistry.ts)
- **Verify no remaining conflicts** after ellipse fix

---

## Phase 4 — Missing Features: Connector & Layer UI `~2 hours`

### 4a — Connector Properties in Properties Panel

#### [MODIFY] [PropertiesPanel.tsx](file:///D:/Working%20Projects/Draw.io/src/components/layout/PropertiesPanel.tsx)
- Detect when a connector is selected (connectors are stored separately from elements)
- Add a **Connector Properties** section:
  - Stroke color picker
  - Stroke width slider
  - Dash pattern selector (solid / dashed / dotted)
  - Connector type toggle (straight / orthogonal / curved)
  - Start/end arrow toggles
  - Label text input
- Wire to new `EditorActions.updateConnector(id, updates)` method

#### [MODIFY] [EditorActions.ts](file:///D:/Working%20Projects/Draw.io/src/editor/EditorActions.ts)
- **Add `updateConnector()`** action that creates an `UpdateConnectorCommand`

#### [NEW] [UpdateConnectorCommand.ts](file:///D:/Working%20Projects/Draw.io/src/editor/commands/UpdateConnectorCommand.ts)
- Mirror of `UpdateElementCommand` but for `Connector` objects

### 4b — Layer Panel UI

#### [MODIFY] [Sidebar.tsx](file:///D:/Working%20Projects/Draw.io/src/components/layout/Sidebar.tsx)
- Add a **Layers** tab alongside Shape Library and Scratchpad
- Layer list: show each layer with visibility toggle (eye icon), lock toggle (lock icon), rename on double-click
- Add/Delete layer buttons
- Drag to reorder layers (optional v2)
- Wire to existing `layer.store.ts` which already has the state

---

## Phase 5 — Missing Features: Drawing & Routing `~1.5 hours`

### 5a — Freehand Drawing Tool

#### [MODIFY] [InteractionManager.ts](file:///D:/Working%20Projects/Draw.io/src/canvas/InteractionManager.ts)
- Add `FREEHAND_DRAWING` FSM phase
- On `mousedown` with `drawTool === 'freehand'`: start capturing points
- On `mousemove`: append points to a live `Point[]` array, render preview path via `ctx`
- On `mouseup`: create `CanvasElement` with type `'freehand'` containing the point array in `metadata.points`

#### [MODIFY] [ShapeRenderer.ts](file:///D:/Working%20Projects/Draw.io/src/canvas/renderer/ShapeRenderer.ts)
- Add `'freehand'` case: draw a smooth path through `metadata.points` using `ctx.bezierCurveTo`

#### [MODIFY] [SVGRenderer.ts](file:///D:/Working%20Projects/Draw.io/src/export/SVGRenderer.ts)
- Add `'freehand'` case: output `<path d="...">` from stored points

### 5b — Bezier Curved Connectors

#### [MODIFY] [routing.ts](file:///D:/Working%20Projects/Draw.io/src/utils/routing.ts)
- Implement `'curved'` case: calculate cubic Bezier control points from source→target direction
- Standard approach: control points offset perpendicular to the connection direction

#### [MODIFY] [ConnectorRenderer.ts](file:///D:/Working%20Projects/Draw.io/src/canvas/renderer/ConnectorRenderer.ts)
- For `type === 'curved'`: use `ctx.bezierCurveTo()` instead of `ctx.lineTo()` through waypoints

---

## Phase 6 — SVG/PNG/PDF Export for All Shape Types `~3 hours`

This is the highest-impact fix. Currently only `rectangle`, `ellipse`, `diamond`, `line`, `image` export correctly.

### Strategy
Each shape pack's `render(ctx, element)` function already draws the correct shape on a Canvas 2D context. The `SVGRenderer` needs equivalent SVG output for each shape type.

**Approach**: Use the HTML5 Canvas as an intermediate renderer — create an offscreen canvas, call the shape's `render()` function, then either:
- **Option A (Fast)**: Serialize the canvas to a PNG data URL and embed it in the SVG as an `<image>` tag per shape — simple but produces raster shapes in SVG
- **Option B (Correct)**: Implement SVG path equivalents for each shape family

**Chosen approach: Option B** — SVG paths for clean, scalable export.

#### [MODIFY] [SVGRenderer.ts](file:///D:/Working%20Projects/Draw.io/src/export/SVGRenderer.ts)
Add `renderElement()` cases for all shape types:

| Shape family | Types to handle | SVG output |
|---|---|---|
| Basic | `parallelogram`, `trapezoid`, `cylinder`, `hexagon`, `star`, `cross` | `<polygon>` / `<path>` |
| Flowchart | `process`, `decision`, `data`, `document`, `terminator` | `<rect>` / `<path>` |
| Arrows | All arrow variants | `<polygon>` / `<path>` |
| UML | `class`, `interface`, `actor`, `state`, `lifeline` | `<rect>` / `<line>` / `<text>` |
| ER | `entity`, `relation`, `attribute`, crow's foot | `<rect>` / `<ellipse>` / `<line>` |
| Misc | `callout`, `bracket`, `brace` | `<path>` |
| Advanced | `card`, `frame`, `list` | `<rect>` / `<text>` |

**Alternative fast path**: Call each shape's Canvas `render()` in a hidden `OffscreenCanvas`, then use `toDataURL()` and embed as SVG `<image>` per element. This guarantees pixel-perfect output with zero new shape code.

> [!IMPORTANT]
> The fast path (OffscreenCanvas → PNG embed) is recommended first to unblock users. True SVG paths can follow as an enhancement. I'll implement the OffscreenCanvas approach for immediate correctness, then add SVG path equivalents for vector quality.

---

## Phase 7 — CommandPalette & Shortcut Registry Integration `~30 min`

#### [MODIFY] [CommandPalette.tsx](file:///D:/Working%20Projects/Draw.io/src/components/ui/CommandPalette.tsx)
- Replace the hardcoded `commands[]` array
- Read all registered shortcuts from `ShortcutRegistry.getAll()` and map them to palette commands
- Add additional palette-only commands (align, distribute, etc.) that have no keyboard shortcut

---

## Verification Plan

### After Each Phase
- Run `npm run dev` — verify app loads with no console errors
- Manually test the specific features changed

### Phase 1 Verification
- Open Command Palette (`Ctrl+K`) — verify slide-down animation works
- Trigger a toast (e.g. save) — verify slide-up animation works
- Right-click canvas — verify no React key warning in console
- Save and reload — verify recent files list persists under new key

### Phase 3 Verification
- `Ctrl+=` / `Ctrl+-` zoom — verify both `ZoomStore.level` and `canvas.store.viewport.zoom` stay in sync
- Open `SettingsDialog` → Storage tab → "Clear Data" — verify scratchpad is NOT deleted
- Press `P` key → draw on canvas — freehand preview should appear

### Phase 4 Verification
- Click a connector → Properties Panel should show connector-specific fields
- Change connector color → canvas updates → Ctrl+Z undoes it
- Click Layers tab in Sidebar → list of layers visible, eye/lock toggles work

### Phase 5 Verification
- Select "Curved" connector type → connectors draw with smooth curves
- Freehand tool: draw a path → shape appears on canvas

### Phase 6 Verification
- Export PNG with a flowchart diagram — all shapes appear (not blank)
- Export SVG — open in browser/Inkscape — all shapes visible
- Export PDF — open in PDF viewer — arrowheads visible (context-stroke fix)

---

## Open Questions

> [!NOTE]
> No blocking questions — proceeding with all fixes as described. The OffscreenCanvas approach for SVG export will be used as the fast path for Phase 6.
