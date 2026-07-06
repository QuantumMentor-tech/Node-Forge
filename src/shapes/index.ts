import { ShapeRegistry } from './core/ShapeRegistry';
import { BasicShapesPack } from './packs/BasicShapes';
import { FlowchartShapesPack } from './packs/FlowchartShapes';
import { ArrowShapesPack } from './packs/ArrowShapes';
import { GeneralShapesPack } from './packs/GeneralShapes';
import { UMLShapesPack } from './packs/UMLShapes';
import { ERShapesPack } from './packs/ERShapes';
import { MiscShapesPack } from './packs/MiscShapes';
import { AdvancedShapesPack } from './packs/AdvancedShapes';

/**
 * Initialize the global shape registry with all built-in shape packs.
 * Called synchronously in main.tsx before React mounts.
 */
export function initializeShapeRegistry() {
  ShapeRegistry.registerAll(BasicShapesPack);
  ShapeRegistry.registerAll(GeneralShapesPack);
  ShapeRegistry.registerAll(FlowchartShapesPack);
  ShapeRegistry.registerAll(ArrowShapesPack);
  ShapeRegistry.registerAll(AdvancedShapesPack);
  ShapeRegistry.registerAll(MiscShapesPack);
  ShapeRegistry.registerAll(UMLShapesPack);
  ShapeRegistry.registerAll(ERShapesPack);
}

export * from './core/ShapeRegistry';
