import { CanvasElement, Viewport, Point } from '@/types/canvas.types';
import { ShapeRegistry } from '@/shapes';
import { useInteractionStore } from '@/stores/interaction.store';

/**
 * Shape types that render their own label internally.
 * The generic label draw in ShapeRenderer is skipped for these types.
 *
 * RULES — add a shape here ONLY if its render() function already calls
 * ctx.fillText() with the element label. Otherwise user labels are silently lost!
 *
 * Defined once as a module-level constant for performance.
 */
export const SELF_LABEL_TYPES = new Set([
  // ── Pure text shapes (render their own text content) ──────────────────────
  'text', 'misc_text_label', 'misc_text_link',

  // ── UML shapes that render a label internally ─────────────────────────────
  'uml_class',        // renders class name in header section
  'uml_interface',    // renders «interface» stereotype + name
  'uml_abstract',     // renders «abstract» stereotype + name
  'uml_object',       // renders underlined object:Class name
  'uml_package',      // renders package name in body
  'uml_component',    // renders component name in body
  'uml_actor',        // renders actor label below figure
  'uml_usecase',      // renders use case name inside ellipse
  'uml_boundary',     // renders label below the boundary circle
  'uml_control',      // renders label below the control circle
  'uml_entity_node',  // renders label below the entity circle
  'uml_state',        // renders state name inside rounded rect
  'uml_lifeline',     // renders object name in lifeline box
  'uml_frame',        // renders frame type label in pentagonal tab
  'uml_constraint',   // renders {constraint} text

  // ── ER shapes that render a label internally ──────────────────────────────
  'er_entity',           // renders entity name in header row
  'er_entity_cols',      // renders entity name + column list
  'er_weak_entity',      // renders weak entity name in header
  'er_table_list',       // renders table name + row list
  'er_attribute',        // renders attribute name in ellipse
  'er_multivalued',      // renders multivalued attribute name in double ellipse
  'er_derived',          // renders derived attribute name in dashed ellipse
  'er_relationship',     // renders relationship name in diamond
  'er_weak_relationship',// renders weak relationship name in double diamond

  // ── Advanced shapes that render a label internally ────────────────────────
  'adv_list_box',  // renders list box title in header
  'adv_card',      // renders card title in header
  'adv_frame',     // renders frame label in header bar

  // ── Table shapes (no user label needed — structure IS the content) ────────
  'adv_table', 'misc_table_3col', 'misc_table_4col', 'misc_table_hdr',

  // ── Icon / symbol shapes (labels would overlap the symbol) ───────────────
  'smiley_happy', 'smiley_sad',
  'uml_initial_state', 'uml_final_state', 'uml_choice', 'uml_fork',
  'uml_activation', 'uml_destruction', 'uml_provided', 'uml_required',

  // ── Line / connector shapes (labels don't apply) ──────────────────────────
  'line', 'misc_hline', 'misc_vline', 'misc_dashed_line', 'misc_wavy_line',
  'misc_corner_bracket', 'misc_angle_right', 'misc_angle_left',
  'er_line_one', 'er_line_many', 'er_line_one_only',
  'er_line_zero_one', 'er_line_one_many', 'er_line_zero_many',
  'er_line_plain', 'er_line_dashed', 'er_line_crow_r', 'er_line_crow_l',
]);

export class ShapeRenderer {
  public static render(
    ctx: CanvasRenderingContext2D,
    elements: CanvasElement[],
    viewport: Viewport
  ): void {
    // Sort elements by zIndex before rendering
    const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

    // Read inline-edit state once per frame (zero-cost Zustand getState call)
    const { inlineEditId } = useInteractionStore.getState();

    ctx.save();
    ctx.translate(viewport.panX, viewport.panY);
    ctx.scale(viewport.zoom, viewport.zoom);

    for (const el of sortedElements) {
      if (!el.visible) continue;

      ctx.save();

      // Apply general styles
      ctx.globalAlpha = el.style.opacity;
      ctx.fillStyle = el.style.fillColor;
      ctx.strokeStyle = el.style.strokeColor;
      ctx.lineWidth = el.style.strokeWidth;

      const { x, y, width, height } = el.bounds;

      // Apply rotation (translating to center first)
      if (el.rotation) {
        ctx.translate(x + width / 2, y + height / 2);
        ctx.rotate((el.rotation * Math.PI) / 180);
        ctx.translate(-(x + width / 2), -(y + height / 2));
      }

      ctx.beginPath();

      // Skip label for the element currently being inline-edited
      const isBeingEdited = el.id === inlineEditId;

      // Dynamic dispatch: look up the shape definition in the registry
      const shapeDef = ShapeRegistry.get(el.type);
      if (el.type === 'freehand') {
        const points = el.metadata?.points as Point[] | undefined;
        if (points && points.length > 0) {
          const origW = (el.metadata?.originalWidth as number) || width || 1;
          const origH = (el.metadata?.originalHeight as number) || height || 1;
          const scaleX = width / origW;
          const scaleY = height / origH;

          ctx.beginPath();
          ctx.moveTo(x + points[0].x * scaleX, y + points[0].y * scaleY);
          for (let i = 1; i < points.length; i++) {
            ctx.lineTo(x + points[i].x * scaleX, y + points[i].y * scaleY);
          }
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          if (el.style.strokeWidth > 0) {
            ctx.stroke();
          }
        }
      } else if (shapeDef) {
        // For SELF_LABEL_TYPES: pass a clone with empty label so the shape's
        // internal ctx.fillText() call produces no text while editing.
        const renderEl: CanvasElement = isBeingEdited
          ? { ...el, label: '' }
          : el;
        shapeDef.render(ctx, renderEl);
      } else {
        // Fallback for unknown / legacy shapes — draw a simple rectangle
        ctx.roundRect(x, y, width, height, 4);
        if (el.style.fillColor !== 'transparent') ctx.fill();
        if (el.style.strokeWidth > 0) ctx.stroke();
        // Label the unknown type for debugging visibility
        ctx.font = '11px Inter';
        ctx.fillStyle = '#6366f1';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(el.type, x + width / 2, y + height / 2);
      }

      // Always restore globalAlpha (some shapes modify it internally)
      ctx.globalAlpha = el.style.opacity;

      // Generic label draw — skip if:
      //  • the shape renders its own label (SELF_LABEL_TYPES)
      //  • no label text
      //  • this element is currently being inline-edited
      if (el.label && !SELF_LABEL_TYPES.has(el.type) && !isBeingEdited) {
        ctx.font = `${el.style.fontSize || 14}px ${el.style.fontFamily || 'Inter'}`;
        ctx.fillStyle = el.style.fontColor || '#1a1d27';
        ctx.textAlign = (el.style.textAlign as CanvasTextAlign) || 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(el.label, x + width / 2, y + height / 2);
      }

      ctx.restore();
    }

    ctx.restore();
  }
}
