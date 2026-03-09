import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlowService } from '../../services/flow.service';
import { ConnectionLineType, ConnectionMode, Position } from '../../types';
import { getBezierPath } from '../../utils/edges/bezier';
import { getStraightPath } from '../../utils/edges/straight';
import { getSmoothStepPath } from '../../utils/edges/smooth-step';
import { getSimpleBezierPath } from '../../utils/edges/simple-bezier';
import { getMarkerId } from '../../utils';

/**
 * Opposite position lookup – mirrors vue-flow's `oppositePosition` map.
 */
const oppositePosition: Record<Position, Position> = {
  [Position.Left]: Position.Right,
  [Position.Right]: Position.Left,
  [Position.Top]: Position.Bottom,
  [Position.Bottom]: Position.Top,
};

@Component({
  selector: 'lib-connection-line',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (_isConnecting()) {
      <svg class="vue-flow__edges vue-flow__connectionline vue-flow__container">
        <g class="vue-flow__connection">
          <path
            class="vue-flow__connection-path"
            [class]="flow.connectionLineOptions().class"
            [attr.d]="_path()"
            [ngStyle]="_style()"
            [attr.marker-end]="_markerEnd()"
            [attr.marker-start]="_markerStart()"
            fill="none"
          />
        </g>
      </svg>
    }
  `,
  styles: [
    `
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
    `,
  ],
})
export class ConnectionLineComponent {
  readonly flow = inject(FlowService);

  _isConnecting = computed(() => {
    const start = this.flow.connectionStartHandle();
    const pos = this.flow.connectionPosition();
    return !!start && !isNaN(pos.x) && !isNaN(pos.y);
  });

  _style = computed(() => {
    return {
      ...this.flow.connectionLineStyle(),
      ...this.flow.connectionLineOptions().style,
    };
  });

  _markerEnd = computed(() => {
    const opts = this.flow.connectionLineOptions();
    return opts.markerEnd
      ? `url(#${getMarkerId(opts.markerEnd, this.flow.id())})`
      : '';
  });

  _markerStart = computed(() => {
    const opts = this.flow.connectionLineOptions();
    return opts.markerStart
      ? `url(#${getMarkerId(opts.markerStart, this.flow.id())})`
      : '';
  });

  /**
   * Mirrors vue-flow ConnectionLine render logic:
   *
   * 1. Find the source node from connectionStartHandle.nodeId
   * 2. Resolve the from-handle from node.handleBounds (respecting connectionMode)
   * 3. Source position = handle center (handle.x/y already center in our impl)
   *    + node.computedPosition
   * 4. Target position = connectionPosition (already flow-coords)
   * 5. targetPosition from connectionEndHandle?.position or oppositePosition
   * 6. Build the path with the configured line type
   */
  _path = computed(() => {
    const startHandle = this.flow.connectionStartHandle();
    if (!startHandle) return '';

    // ── from node ──────────────────────────────────────────────
    const fromNode = this.flow.getNode(startHandle.nodeId);
    if (!fromNode) return '';

    const handleType = startHandle.type;
    const startHandleId = startHandle.id;
    const connectionMode = this.flow.connectionMode();

    // Resolve handle bounds (same logic as vue-flow)
    const fromHandleBounds = fromNode.handleBounds;
    let handleBounds = fromHandleBounds?.[handleType] ?? [];

    if (connectionMode === ConnectionMode.Loose) {
      const oppositeBounds =
        fromHandleBounds?.[handleType === 'source' ? 'target' : 'source'] ?? [];
      handleBounds = [...handleBounds, ...oppositeBounds];
    }

    if (!handleBounds.length) return '';

    const fromHandle =
      (startHandleId
        ? handleBounds.find((d) => d.id === startHandleId)
        : handleBounds[0]) ?? null;

    const fromPosition = fromHandle?.position ?? Position.Top;

    // Source coordinates: handle offset + node.computedPosition
    // (In our impl handle.x/y are already handle-center offsets relative to node)
    const sourceX = fromNode.computedPosition.x + (fromHandle?.x ?? 0);
    const sourceY = fromNode.computedPosition.y + (fromHandle?.y ?? 0);

    // ── target ─────────────────────────────────────────────────
    const pos = this.flow.connectionPosition();
    const targetX = pos.x;
    const targetY = pos.y;

    // Target position: from connectionEndHandle if hovering a handle,
    // otherwise opposite of source position (same as vue-flow)
    const endHandle = this.flow.connectionEndHandle();
    const toPosition =
      endHandle?.position ??
      (fromPosition ? oppositePosition[fromPosition] : null);

    if (!fromPosition || !toPosition) return '';

    // ── path type ──────────────────────────────────────────────
    const type =
      this.flow.connectionLineType() ??
      this.flow.connectionLineOptions().type ??
      ConnectionLineType.Bezier;

    const pathParams = {
      sourceX,
      sourceY,
      sourcePosition: fromPosition,
      targetX,
      targetY,
      targetPosition: toPosition,
    };

    switch (type) {
      case ConnectionLineType.Straight:
        return getStraightPath(pathParams)[0];
      case ConnectionLineType.Step:
        // vue-flow uses getSmoothStepPath with borderRadius: 0 for Step
        return getSmoothStepPath({ ...pathParams, borderRadius: 0 })[0];
      case ConnectionLineType.SmoothStep:
        return getSmoothStepPath(pathParams)[0];
      case ConnectionLineType.SimpleBezier:
        return getSimpleBezierPath(pathParams)[0];
      case ConnectionLineType.Bezier:
      default:
        return getBezierPath(pathParams)[0];
    }
  });
}
