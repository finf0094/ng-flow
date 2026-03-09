import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlowService } from '../../services/flow.service';
import { MarkerDefsComponent } from './marker-defs.component';
import type { GraphEdge, GraphNode } from '../../types';
import { Position } from '../../types';
import { getMarkerId } from '../../utils';
import { getBezierPath } from '../../utils/edges/bezier';
import { getStraightPath } from '../../utils/edges/straight';
import { getStepPath, getSmoothStepPath } from '../../utils/edges/smooth-step';
import { getSimpleBezierPath } from '../../utils/edges/simple-bezier';

interface ResolvedEdge {
  edge: GraphEdge;
  path: string;
  labelX: number;
  labelY: number;
  markerStart?: string;
  markerEnd?: string;
  zIndex: number;
}

@Component({
  selector: 'lib-edge-renderer',
  standalone: true,
  imports: [CommonModule, MarkerDefsComponent],
  template: `
    <lib-marker-defs />
    <svg class="vue-flow__edges vue-flow__container">
      @for (re of _resolvedEdges(); track re.edge.id) {
        <g
          class="vue-flow__edge"
          [class.selected]="re.edge.selected"
          [class.animated]="re.edge.animated"
          [attr.data-id]="re.edge.id"
          [style.display]="re.edge.hidden ? 'none' : ''"
          [style.z-index]="re.zIndex"
          (click)="_onEdgeClick($event, re.edge)"
          (dblclick)="_onEdgeDblClick($event, re.edge)"
          (contextmenu)="_onEdgeContextMenu($event, re.edge)"
          (mouseenter)="_onEdgeMouseEnter($event, re.edge)"
          (mouseleave)="_onEdgeMouseLeave($event, re.edge)"
        >
          <path
            [attr.id]="re.edge.id"
            [attr.d]="re.path"
            fill="none"
            class="vue-flow__edge-path"
            [ngStyle]="re.edge.style"
            [attr.marker-start]="re.markerStart"
            [attr.marker-end]="re.markerEnd"
          />
          @if (re.edge.interactionWidth ?? 20 > 0) {
            <path
              [attr.d]="re.path"
              fill="none"
              stroke-opacity="0"
              [attr.stroke-width]="re.edge.interactionWidth ?? 20"
              class="vue-flow__edge-interaction"
            />
          }
          @if (re.edge.label) {
            <g [attr.transform]="'translate(' + re.labelX + ' ' + re.labelY + ')'">
              @if (re.edge.labelShowBg !== false) {
                <rect
                  [attr.height]="12"
                  [attr.rx]="re.edge.labelBgBorderRadius ?? 2"
                  [attr.ry]="re.edge.labelBgBorderRadius ?? 2"
                  fill="white"
                  class="vue-flow__edge-textbg"
                />
              }
              <text
                class="vue-flow__edge-text"
                text-anchor="middle"
                dominant-baseline="middle"
                [ngStyle]="re.edge.labelStyle"
              >{{ re.edge.label }}</text>
            </g>
          }
        </g>
      }
    </svg>
  `,
  styles: [`
    :host {
      display: contents;
    }
    svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: visible;
      pointer-events: none;
    }
    g {
      pointer-events: all;
    }
    .vue-flow__edge-interaction {
      pointer-events: stroke;
    }
  `],
})
export class EdgeRendererComponent {
  readonly flow = inject(FlowService);

  _resolvedEdges = computed<ResolvedEdge[]>(() => {
    const edges = this.flow.getEdges();
    const nodeLookup = this.flow.nodeLookup(); // track node positions so edges update on drag
    const flowId = this.flow.id();

    return edges.map((edge) => {
      const sourceNode = nodeLookup.get(edge.source);
      const targetNode = nodeLookup.get(edge.target);
      const [path, labelX, labelY] = this._computePath(edge, sourceNode, targetNode);
      const markerStart = edge.markerStart
        ? `url('#${getMarkerId(edge.markerStart, flowId)}')`
        : undefined;
      const markerEnd = edge.markerEnd
        ? `url('#${getMarkerId(edge.markerEnd, flowId)}')`
        : undefined;
      const zIndex = edge.zIndex ?? 0;
      const elevatedZIndex = edge.selected && this.flow.elevateEdgesOnSelect() ? zIndex + 1000 : zIndex;

      return { edge, path, labelX, labelY, markerStart, markerEnd, zIndex: elevatedZIndex };
    });
  });

  private _computePath(edge: GraphEdge, sourceNode?: GraphNode, targetNode?: GraphNode): [string, number, number] {
    if (!sourceNode || !targetNode) return ['', 0, 0];

    // Find the specific handle by edge.sourceHandle / edge.targetHandle id,
    // falling back to the first registered handle of the matching type.
    const srcHandle = sourceNode.handleBounds?.source?.find(
      (h) => h.id === (edge.sourceHandle ?? null),
    ) ?? sourceNode.handleBounds?.source?.[0];

    const tgtHandle = targetNode.handleBounds?.target?.find(
      (h) => h.id === (edge.targetHandle ?? null),
    ) ?? targetNode.handleBounds?.target?.[0];

    // Handle x/y are offsets relative to the node in flow-coordinates.
    // If no handle is registered, fall back to a position-based default.
    const sw = sourceNode.dimensions.width ?? 0;
    const sh = sourceNode.dimensions.height ?? 0;
    const tw = targetNode.dimensions.width ?? 0;
    const th = targetNode.dimensions.height ?? 0;

    const sourcePosition = srcHandle?.position ?? sourceNode.sourcePosition ?? Position.Bottom;
    const targetPosition = tgtHandle?.position ?? targetNode.targetPosition ?? Position.Top;

    const srcOffset = srcHandle
      ? { x: srcHandle.x, y: srcHandle.y }
      : this._fallbackHandleOffset(sourcePosition, sw, sh);
    const tgtOffset = tgtHandle
      ? { x: tgtHandle.x, y: tgtHandle.y }
      : this._fallbackHandleOffset(targetPosition, tw, th);

    const sourceX = sourceNode.computedPosition.x + srcOffset.x;
    const sourceY = sourceNode.computedPosition.y + srcOffset.y;
    const targetX = targetNode.computedPosition.x + tgtOffset.x;
    const targetY = targetNode.computedPosition.y + tgtOffset.y;

    const pathOptions = (edge as any).pathOptions ?? {};

    let result: [string, number, number, number, number];

    switch (edge.type) {
      case 'straight':
        result = getStraightPath({ sourceX, sourceY, targetX, targetY });
        break;
      case 'step':
        result = getStepPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, offset: pathOptions.offset });
        break;
      case 'smoothstep':
        result = getSmoothStepPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, borderRadius: pathOptions.borderRadius, offset: pathOptions.offset });
        break;
      case 'simple-bezier':
        result = getSimpleBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });
        break;
      case 'default':
      default:
        result = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, curvature: pathOptions.curvature });
        break;
    }

    return [result[0], result[1], result[2]];
  }

  /** Default handle offset when no handle element is registered on the node. */
  private _fallbackHandleOffset(pos: Position, w: number, h: number): { x: number; y: number } {
    switch (pos) {
      case Position.Left:   return { x: 0,     y: h / 2 };
      case Position.Right:  return { x: w,     y: h / 2 };
      case Position.Top:    return { x: w / 2, y: 0     };
      case Position.Bottom: return { x: w / 2, y: h     };
      default:              return { x: w / 2, y: h / 2 };
    }
  }

  _onEdgeClick(event: MouseEvent, edge: GraphEdge): void {
    if (this.flow.elementsSelectable()) {
      const multi = event.ctrlKey || event.metaKey || event.shiftKey;
      if (!multi) {
        this.flow.edges().forEach((e) => {
          if (e.id !== edge.id && e.selected) this.flow.updateEdge(e.id, { selected: false });
        });
      }
      this.flow.updateEdge(edge.id, { selected: !edge.selected });
    }
    this.flow.edgeClick$.next({ event, edge });
  }

  _onEdgeDblClick(event: MouseEvent, edge: GraphEdge): void {
    this.flow.edgeDoubleClick$.next({ event, edge });
  }

  _onEdgeContextMenu(event: MouseEvent, edge: GraphEdge): void {
    this.flow.edgeContextMenu$.next({ event, edge });
  }

  _onEdgeMouseEnter(event: MouseEvent, edge: GraphEdge): void {
    this.flow.edgeMouseEnter$.next({ event, edge });
  }

  _onEdgeMouseLeave(event: MouseEvent, edge: GraphEdge): void {
    this.flow.edgeMouseLeave$.next({ event, edge });
  }
}
