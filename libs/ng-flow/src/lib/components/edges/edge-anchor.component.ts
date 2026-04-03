import {
  Component,
  inject,
  input,
  NO_ERRORS_SCHEMA,
  OnDestroy,
} from '@angular/core';
import { FlowService } from '../../services/flow.service';
import { EDGE_ID_TOKEN } from './edge-id.token';
import { updateEdge } from '../../utils/graph';
import type { GraphEdge, HandleType, XYPosition } from '../../types';

/**
 * Rendered at the source or target endpoint of an edge.
 * When dragged, initiates an edge reconnect (edgesUpdatable must be set).
 * Mirrors vue-flow EdgeAnchor behaviour.
 */
@Component({
  selector: '[lib-edge-anchor]',
  standalone: true,
  schemas: [NO_ERRORS_SCHEMA],
  template: ``,
  host: {
    'class': 'ng-flow__edgeupdater',
    '[attr.cx]': 'x()',
    '[attr.cy]': 'y()',
    '[attr.r]': '10',
    'stroke': 'transparent',
    'fill': 'transparent',
    'stroke-width': '20',
    'cursor': 'crosshair',
    '(mousedown)': '_onPointerDown($event)',
    '(touchstart)': '_onPointerDown($event)',
  },
})
export class EdgeAnchorComponent implements OnDestroy {
  readonly x = input.required<number>();
  readonly y = input.required<number>();
  readonly handleType = input.required<HandleType>();

  private readonly flow = inject(FlowService);
  private readonly edgeId = inject(EDGE_ID_TOKEN);

  private _reconnecting = false;
  private _originalEdge: GraphEdge | null = null;
  private readonly _onMove = this._handleMove.bind(this);
  private readonly _onUp = this._handleUp.bind(this);

  _onPointerDown(event: MouseEvent | TouchEvent): void {
    event.stopPropagation();
    const edge = this.flow.edgeLookup().get(this.edgeId);
    if (!edge) return;

    this._originalEdge = edge;
    this._reconnecting = true;

    this.flow.edgeUpdateStart$.next({ event: event as MouseEvent, edge });

    // Temporarily hide this edge so the connection line appears cleanly
    this.flow.edges.update((prev) =>
      prev.map((e) => (e.id === this.edgeId ? { ...e, hidden: true } : e)),
    );

    // Start connection from the appropriate node/handle
    const handleType = this.handleType();
    const nodeId = handleType === 'source' ? edge.source : edge.target;
    const handleId = handleType === 'source' ? (edge.sourceHandle ?? null) : (edge.targetHandle ?? null);

    const node = this.flow.nodeLookup().get(nodeId);
    if (!node) return;

    const handles = node.handleBounds?.[handleType] ?? [];
    const handle = handles.find((h) => h.id === handleId) ?? handles[0];
    if (!handle) return;

    const vp = this.flow.viewport();
    const absX = node.computedPosition.x * vp.zoom + vp.x + handle.x * vp.zoom;
    const absY = node.computedPosition.y * vp.zoom + vp.y + handle.y * vp.zoom;

    this.flow.startConnection(handle, { x: absX, y: absY });

    document.addEventListener('mousemove', this._onMove);
    document.addEventListener('mouseup', this._onUp);
    document.addEventListener('touchmove', this._onMove);
    document.addEventListener('touchend', this._onUp);
  }

  private _handleMove(event: MouseEvent | TouchEvent): void {
    if (!this._reconnecting) return;
    const pos = this._getEventPosition(event);
    this.flow.updateConnection(pos);
  }

  private _handleUp(event: MouseEvent | TouchEvent): void {
    if (!this._reconnecting) return;
    this._reconnecting = false;

    document.removeEventListener('mousemove', this._onMove);
    document.removeEventListener('mouseup', this._onUp);
    document.removeEventListener('touchmove', this._onMove);
    document.removeEventListener('touchend', this._onUp);

    const originalEdge = this._originalEdge!;
    this._originalEdge = null;

    // Find which handle the pointer ended up on
    const { connection } = this.flow.connectionEndHandle()
      ? { connection: this.flow.connectionEndHandle() }
      : { connection: null };

    const endHandle = this.flow.connectionEndHandle();

    if (endHandle) {
      // Build a new connection from the reconnect
      const handleType = this.handleType();
      const newConnection = handleType === 'source'
        ? {
            source: endHandle.nodeId,
            sourceHandle: endHandle.id ?? null,
            target: originalEdge.target,
            targetHandle: originalEdge.targetHandle ?? null,
          }
        : {
            source: originalEdge.source,
            sourceHandle: originalEdge.sourceHandle ?? null,
            target: endHandle.nodeId,
            targetHandle: endHandle.id ?? null,
          };

      const updatedEdges = updateEdge(originalEdge, newConnection, this.flow.edges() as any);
      this.flow.setEdges(updatedEdges as any);
      this.flow.edgeUpdate$.next({ event: event as MouseEvent, edge: originalEdge, connection: newConnection as any });
    } else {
      // No valid target — restore the original edge
      this.flow.edges.update((prev) =>
        prev.map((e) => (e.id === originalEdge.id ? { ...e, hidden: false } : e)),
      );
    }

    this.flow.endConnection(event as MouseEvent);
    this.flow.edgeUpdateEnd$.next({ event: event as MouseEvent, edge: originalEdge });
  }

  private _getEventPosition(event: MouseEvent | TouchEvent): XYPosition {
    const flowEl = this.flow.flowRef;
    if (!flowEl) return { x: 0, y: 0 };
    const bounds = flowEl.getBoundingClientRect();
    let clientX: number;
    let clientY: number;
    if ('touches' in event) {
      clientX = event.touches[0]?.clientX ?? 0;
      clientY = event.touches[0]?.clientY ?? 0;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    return { x: clientX - bounds.left, y: clientY - bounds.top };
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousemove', this._onMove);
    document.removeEventListener('mouseup', this._onUp);
    document.removeEventListener('touchmove', this._onMove);
    document.removeEventListener('touchend', this._onUp);
    // If destroyed mid-drag, restore edge visibility and clean up connection state
    if (this._reconnecting && this._originalEdge) {
      const edge = this._originalEdge;
      this.flow.edges.update((prev) =>
        prev.map((e) => (e.id === edge.id ? { ...e, hidden: false } : e)),
      );
      this.flow.endConnection();
      this._reconnecting = false;
      this._originalEdge = null;
    }
  }
}
