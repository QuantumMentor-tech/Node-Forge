import { ReactNode } from 'react';
import { CanvasElement, Point, Size } from '@/types/canvas.types';

export interface ShapeDefinition {
  /** Unique identifier for the shape type (e.g., 'rectangle', 'flowchart_decision') */
  type: string;
  
  /** Human-readable name for UI */
  name: string;
  
  /** Category for grouping in the sidebar */
  category: string;
  
  /** Icon for the sidebar */
  icon: ReactNode;
  
  /** Default dimensions when dropped */
  defaultSize: Size;
  
  /**
   * Factory function to initialize the shape instance with correct defaults.
   * Receives the generated base element and mutates/returns it.
   */
  create: (baseElement: CanvasElement) => CanvasElement;
  
  /**
   * Rendering function for the canvas.
   */
  render: (ctx: CanvasRenderingContext2D, element: CanvasElement) => void;
}

export interface ShapeCategory {
  id: string;
  name: string;
  shapes: ShapeDefinition[];
}

export class ShapeRegistry {
  private static shapes: Map<string, ShapeDefinition> = new Map();

  /**
   * Register a new shape definition.
   */
  static register(definition: ShapeDefinition): void {
    if (this.shapes.has(definition.type)) {
      console.warn(`ShapeRegistry: Overwriting existing shape definition for '${definition.type}'`);
    }
    this.shapes.set(definition.type, definition);
  }

  /**
   * Register multiple shape definitions at once.
   */
  static registerAll(definitions: ShapeDefinition[]): void {
    for (const def of definitions) {
      this.register(def);
    }
  }

  /**
   * Get a shape definition by type.
   */
  static get(type: string): ShapeDefinition | undefined {
    return this.shapes.get(type);
  }

  /**
   * Get all registered shapes.
   */
  static getAll(): ShapeDefinition[] {
    return Array.from(this.shapes.values());
  }

  /**
   * Get shapes grouped by category for the sidebar.
   */
  static getCategories(): ShapeCategory[] {
    const categoriesMap = new Map<string, ShapeDefinition[]>();
    
    for (const shape of this.shapes.values()) {
      if (!categoriesMap.has(shape.category)) {
        categoriesMap.set(shape.category, []);
      }
      categoriesMap.get(shape.category)!.push(shape);
    }

    // Convert map to array and maintain a standard sorting order
    const categories: ShapeCategory[] = Array.from(categoriesMap.entries()).map(([name, shapes]) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      shapes
    }));

    // Optional: Sort categories by standard naming convention if desired
    const categoryOrder = ['Basic Shapes', 'General', 'Flowchart', 'Arrows', 'Advanced', 'Misc', 'UML', 'Entity Relation'];
    categories.sort((a, b) => {
      const idxA = categoryOrder.indexOf(a.name);
      const idxB = categoryOrder.indexOf(b.name);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });

    return categories;
  }
}
