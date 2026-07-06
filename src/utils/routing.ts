import { Point, ConnectorType } from '@/types/canvas.types';

/**
 * Calculates intermediate waypoints for a connector between source and target points.
 */
export function calculateWaypoints(
  source: Point,
  target: Point,
  type: ConnectorType
): Point[] {
  switch (type) {
    case 'straight':
      return [source, target];
    
    case 'orthogonal': {
      // Standard "Manhattan" elbow routing with a middle break
      const dx = Math.abs(target.x - source.x);
      const dy = Math.abs(target.y - source.y);
      
      // If mostly horizontal distance, break horizontally halfway
      if (dx > dy) {
        const midX = source.x + (target.x - source.x) / 2;
        return [
          source,
          { x: midX, y: source.y },
          { x: midX, y: target.y },
          target
        ];
      } else {
        // If mostly vertical distance, break vertically halfway
        const midY = source.y + (target.y - source.y) / 2;
        return [
          source,
          { x: source.x, y: midY },
          { x: target.x, y: midY },
          target
        ];
      }
    }
    
    case 'curved': {
      const dx = Math.abs(target.x - source.x);
      const dy = Math.abs(target.y - source.y);
      if (dx > dy) {
        const offset = Math.max(30, dx * 0.4);
        const sign = target.x > source.x ? 1 : -1;
        return [
          source,
          { x: source.x + offset * sign, y: source.y },
          { x: target.x - offset * sign, y: target.y },
          target
        ];
      } else {
        const offset = Math.max(30, dy * 0.4);
        const sign = target.y > source.y ? 1 : -1;
        return [
          source,
          { x: source.x, y: source.y + offset * sign },
          { x: target.x, y: target.y - offset * sign },
          target
        ];
      }
    }
      
    default:
      return [source, target];
  }
}
