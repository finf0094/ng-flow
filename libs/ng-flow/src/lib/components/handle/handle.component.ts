import {
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  afterNextRender,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlowService } from '../../services/flow.service';
import { NODE_ID_TOKEN } from '../nodes/node-id.token';
import type { Connection, HandleConnectable, HandleElement, HandleType, ValidConnectionFunc, XYPosition } from '../../types';
import { Position } from '../../types';
import {
  getClosestHandle,
  isValidHandle,
  getConnectionStatus,
  resetRecentHandle,
} from '../../utils/handle';

@Component({
  selector: 'lib-handle',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content />`,
  host: {
    'class': 'vue-flow__handle nodrag nopan',
    '[class.source]': 'type() === "source"',
    '[class.target]': 'type() === "target"',
    '[class.left]': 'position() === "left"',
    '[class.right]': 'position() === "right"',
    '[class.top]': 'position() === "top"',
    '[class.bottom]': 'position() === "bottom"',
    '[class.connectable]': '_isConnectable()',
    '[class.connecting]': '_isConnecting()',
    '[class.connectablestart]': 'connectableStart()',
    '[class.connectableend]': 'connectableEnd()',
    '[attr.data-handleid]': 'id()',
    '[attr.data-handlepos]': 'position()',
    '[attr.data-nodeid]': '_nodeId',
    '[style.position]': '"absolute"',
  },
})
export class HandleComponent {
  readonly id = input<string | null>(null);
  readonly type = input<HandleType>('source');
  readonly position = input<Position>(Position.Top);
  readonly isValidConnection = input<ValidConnectionFunc | null>(null);
  readonly connectable = input<HandleConnectable>(undefined!);
  readonly connectableStart = input<boolean>(true);
  readonly connectableEnd = input<boolean>(true);

  private readonly flow = inject(FlowService);
  readonly _nodeId = inject(NODE_ID_TOKEN, { optional: true }) ?? '';
  private readonly el = inject(ElementRef<HTMLDivElement>);

  // ─── computed state ──────────────────────────────────────────

  _isConnecting = computed(() => {
    const startHandle = this.flow.connectionStartHandle();
    const endHandle = this.flow.connectionEndHandle();
    const clickStart = this.flow.connectionClickStartHandle();
    const handleId = this.id();
    const type = this.type();
    return (
      (startHandle?.nodeId === this._nodeId &&
        startHandle?.id === handleId &&
        startHandle?.type === type) ||
      (endHandle?.nodeId === this._nodeId &&
        endHandle?.id === handleId &&
        endHandle?.type === type) ||
      (clickStart?.nodeId === this._nodeId &&
        clickStart?.id === handleId &&
        clickStart?.type === type)
    );
  });

  _isConnectable = computed(() => {
    const connectable = this.connectable();
    if (connectable === undefined || connectable === true) return true;
    if (connectable === false) return false;
    if (connectable === 0) return false;
    if (typeof connectable === 'number') {
      const node = this.flow.getNode(this._nodeId);
      if (!node) return true;
      const edges = this.flow.edges();
      const type = this.type();
      const handleId = this.id();
      const connectedCount = edges.filter((e) => {
        if (e[type as 'source' | 'target'] !== this._nodeId) return false;
        const handleKey = type === 'source' ? 'sourceHandle' : 'targetHandle';
        return handleId ? e[handleKey] === handleId : true;
      }).length;
      return connectedCount < connectable;
    }
    if (connectable === 'single') {
      const edges = this.flow.edges();
      const type = this.type();
      const handleId = this.id();
      return !edges.some((e) => {
        if (e[type as 'source' | 'target'] !== this._nodeId) return false;
        const handleKey = type === 'source' ? 'sourceHandle' : 'targetHandle';
        return handleId ? e[handleKey] === handleId : true;
      });
    }
    if (typeof connectable === 'function') {
      const node = this.flow.getNode(this._nodeId);
      if (!node) return true;
      const edges = this.flow.edges();
      return connectable(node, edges);
    }
    return true;
  });

  // ─── lifecycle ───────────────────────────────────────────────

  constructor() {
    afterNextRender(() => {
      this._updateHandleBounds();
    });
  }

  // ─── handle bounds registration ─────────────────────────────

  private _updateHandleBounds(): void {
    const el = this.el.nativeElement as HTMLElement;
    const nodeEl = el.closest('.vue-flow__node') as HTMLElement;
    if (!nodeEl) return;

    const nodeId = this._nodeId;
    if (!nodeId) return;

    const zoom = this.flow.viewport().zoom || 1;
    const nodeRect = nodeEl.getBoundingClientRect();
    const handleRect = el.getBoundingClientRect();

    const x = (handleRect.left + handleRect.width / 2 - nodeRect.left) / zoom;
    const y = (handleRect.top + handleRect.height / 2 - nodeRect.top) / zoom;

    const node = this.flow.getNode(nodeId);
    if (!node) return;

    const type = this.type();
    const handleId = this.id() ?? null;

    const handleEl = {
      id: handleId,
      type,
      nodeId,
      position: this.position(),
      x,
      y,
      width: handleRect.width / zoom,
      height: handleRect.height / zoom,
    };

    const bounds = { ...node.handleBounds };
    if (type === 'source') {
      const existing = bounds.source || [];
      const idx = existing.findIndex((h) => h.id === handleId);
      if (idx >= 0) existing[idx] = handleEl;
      else existing.push(handleEl);
      bounds.source = existing;
    } else {
      const existing = bounds.target || [];
      const idx = existing.findIndex((h) => h.id === handleId);
      if (idx >= 0) existing[idx] = handleEl;
      else existing.push(handleEl);
      bounds.target = existing;
    }

    this.flow.updateNode(nodeId, { handleBounds: bounds });
  }

  // ─── event listeners ────────────────────────────────────────

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.connectableStart() || !this._isConnectable()) return;
    this._handlePointerDown(event);
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    if (!this.flow.connectOnClick()) return;
    this._handleClick(event);
  }

  // ─── pointer-down (drag connection) ─────────────────────────
  // Mirrors vue-flow useHandle → handlePointerDown

  private _handlePointerDown(event: MouseEvent): void {
    if (!this._nodeId) return;

    const fromNodeId = this._nodeId;
    const fromHandleId = this.id() ?? null;
    const fromType = this.type();

    const fromHandle: { nodeId: string; type: HandleType; id: string | null } = {
      nodeId: fromNodeId,
      type: fromType,
      id: fromHandleId,
    };

    // Set start handle
    this.flow.connectionStartHandle.set({
      nodeId: fromNodeId,
      type: fromType,
      id: fromHandleId,
      position: this.position(),
      x: 0,
      y: 0,
    });

    this.flow.connectStart$.next({
      event,
      nodeId: fromNodeId,
      handleId: fromHandleId,
      handleType: fromType,
    });

    let closestHandle: HandleElement | null = null;
    let connection: Connection | null = null;
    let isValid: boolean | null = false;
    let prevActiveHandle: Element | null = null;

    const onPointerMove = (e: MouseEvent) => {
      const flowRef = this.flow.flowRef;
      if (!flowRef) return;
      const rect = flowRef.getBoundingClientRect();
      const vp = this.flow.viewport();

      // Mouse in flow-coordinates
      const mouseFlow: XYPosition = {
        x: (e.clientX - rect.left - vp.x) / vp.zoom,
        y: (e.clientY - rect.top - vp.y) / vp.zoom,
      };

      // Find closest handle
      closestHandle = getClosestHandle(
        mouseFlow,
        this.flow.connectionRadius(),
        this.flow.nodeLookup(),
        fromHandle,
      );

      // Validate
      const result = isValidHandle({
        handle: closestHandle,
        connectionMode: this.flow.connectionMode(),
        fromNodeId,
        fromHandleId,
        fromType,
        isValidConnection: this.isValidConnection() ?? this.flow.isValidConnection(),
        nodeLookup: this.flow.nodeLookup(),
        edges: this.flow.edges(),
      });

      connection = result.connection;
      isValid = !!closestHandle && result.isValid;

      // Update connection state (mirrors vue-flow updateConnection)
      if (closestHandle && isValid) {
        // Snap to handle position
        this.flow.connectionPosition.set({ x: closestHandle.x, y: closestHandle.y });
        this.flow.connectionEndHandle.set({
          nodeId: closestHandle.nodeId,
          type: closestHandle.type,
          id: closestHandle.id ?? null,
          position: closestHandle.position,
          x: 0,
          y: 0,
        });
      } else {
        // Free cursor tracking
        this.flow.connectionPosition.set(mouseFlow);
        this.flow.connectionEndHandle.set(null);
      }

      this.flow.connectionStatus.set(
        getConnectionStatus(!!closestHandle, isValid),
      );

      // CSS feedback on target handle
      if (!closestHandle || !isValid) {
        resetRecentHandle(prevActiveHandle);
        prevActiveHandle = null;
        return;
      }

      if (connection && connection.source !== connection.target) {
        const handleDom =
          flowRef.querySelector(
            `.vue-flow__handle[data-nodeid="${closestHandle.nodeId}"][data-handleid="${closestHandle.id ?? ''}"]`,
          ) ??
          flowRef.querySelector(
            `.vue-flow__handle[data-nodeid="${closestHandle.nodeId}"].${closestHandle.type}`,
          );

        if (handleDom && handleDom !== prevActiveHandle) {
          resetRecentHandle(prevActiveHandle);
          prevActiveHandle = handleDom;
          handleDom.classList.add('connecting', 'vue-flow__handle-connecting');
          handleDom.classList.toggle('valid', !!isValid);
          handleDom.classList.toggle('vue-flow__handle-valid', !!isValid);
        }
      }
    };

    const onPointerUp = (e: MouseEvent) => {
      document.removeEventListener('mousemove', onPointerMove);
      document.removeEventListener('mouseup', onPointerUp);

      // Emit connection if valid
      if ((closestHandle) && connection && isValid) {
        this.flow.connect$.next(connection);
      }

      // Clean up (mirrors vue-flow endConnection)
      resetRecentHandle(prevActiveHandle);
      this.flow.connectionStartHandle.set(null);
      this.flow.connectionEndHandle.set(null);
      this.flow.connectionStatus.set(null);
      this.flow.connectionPosition.set({ x: Number.NaN, y: Number.NaN });

      this.flow.connectEnd$.next(e);
    };

    document.addEventListener('mousemove', onPointerMove);
    document.addEventListener('mouseup', onPointerUp);
  }

  // ─── click connection ───────────────────────────────────────
  // Mirrors vue-flow useHandle → handleClick

  private _handleClick(event: MouseEvent): void {
    const clickStart = this.flow.connectionClickStartHandle();

    if (!clickStart) {
      // Start click-connection
      if (!this._nodeId) return;

      this.flow.connectionClickStartHandle.set({
        nodeId: this._nodeId,
        type: this.type(),
        id: this.id() ?? null,
        position: this.position(),
        x: 0,
        y: 0,
      });

      this.flow.clickConnectStart$.next({
        event,
        nodeId: this._nodeId,
        handleId: this.id() ?? null,
        handleType: this.type(),
      });
      return;
    }

    // Complete click-connection
    if (!this._nodeId) return;

    const result = isValidHandle({
      handle: {
        nodeId: this._nodeId,
        id: this.id() ?? null,
        type: this.type(),
        position: this.position(),
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
      connectionMode: this.flow.connectionMode(),
      fromNodeId: clickStart.nodeId,
      fromHandleId: clickStart.id ?? null,
      fromType: clickStart.type,
      isValidConnection: this.isValidConnection() ?? this.flow.isValidConnection(),
      nodeLookup: this.flow.nodeLookup(),
      edges: this.flow.edges(),
    });

    if (result.isValid && result.connection) {
      const isOwnHandle =
        result.connection.source === result.connection.target;
      if (!isOwnHandle) {
        this.flow.connect$.next(result.connection);
      }
    }

    this.flow.connectionClickStartHandle.set(null);
    this.flow.clickConnectEnd$.next(event);
  }
}
