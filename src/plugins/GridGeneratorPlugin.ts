/**
 * GridGeneratorPlugin.ts
 *
 * A sample plugin to demonstrate the EditorAPI and Plugin Sandbox.
 * Automatically generates a 3x3 grid of shapes when activated.
 */

import { IPlugin } from './PluginManager';
import { EditorAPI } from './EditorAPI';

export const GridGeneratorPlugin: IPlugin = {
  metadata: {
    id: 'core.grid-generator',
    name: 'Smart Grid Generator',
    description: 'Instantly generates a beautiful 3x3 layout matrix using the Editor API.',
    version: '1.0.0',
    author: 'Draw.io Core',
  },
  
  onActivate: (api: EditorAPI) => {
    console.log('[GridGeneratorPlugin] Activated!');
    
    const startX = 200;
    const startY = 200;
    const gap = 120;
    const size = 80;

    const ids: string[] = [];

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const x = startX + col * gap;
        const y = startY + row * gap;

        // Alternate colors for aesthetic appeal
        const color = ((row + col) % 2 === 0) ? '#6366f1' : '#ec4899';
        
        const shape = api.shapes.add('rectangle', { x, y, width: size, height: size }, `Node ${row}-${col}`);
        api.shapes.update(shape.id, { 
          style: { ...shape.style, fillColor: color, borderRadius: 12 } 
        }, 'Plugin Action');
        
        ids.push(shape.id);
      }
    }

    // Select all the newly created nodes
    api.selection.set(ids);
    
    // Pan to center the new grid
    api.viewport.panTo(-startX + 300, -startY + 200);
  },

  onDeactivate: () => {
    console.log('[GridGeneratorPlugin] Deactivated.');
    // Real plugins might clean up their custom UI panels here.
  }
};
