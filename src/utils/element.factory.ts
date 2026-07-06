import { CanvasElement, Point, Size } from '@/types/canvas.types';
import { ShapeRegistry } from '@/shapes';
import { useThemeStore } from '@/stores/theme.store';

export function createElement(
  type: string,
  position: Point,
  size?: Size
): CanvasElement {
  const id = `${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  const shapeDef = ShapeRegistry.get(type);

  // Baseline generic element
  let el: CanvasElement = {
    id,
    type,
    bounds: {
      x: position.x,
      y: position.y,
      width: size?.width ?? shapeDef?.defaultSize.width ?? 100,
      height: size?.height ?? shapeDef?.defaultSize.height ?? 100,
    },
    label: '',
    style: {
      fillColor: useThemeStore.getState().mode === 'dark' ? '#1f2937' : '#ffffff',
      strokeColor: useThemeStore.getState().mode === 'dark' ? '#f3f4f6' : '#1a1d27',
      strokeWidth: 2,
      opacity: 1,
      borderRadius: 0,
      fontSize: 14,
      fontFamily: 'Inter',
      fontColor: useThemeStore.getState().mode === 'dark' ? '#f3f4f6' : '#1a1d27',
      textAlign: 'center',
    },
    rotation: 0,
    locked: false,
    visible: true,
    zIndex: Date.now(),
  };

  if (shapeDef) {
    el = shapeDef.create(el);
  }

  return el;
}
