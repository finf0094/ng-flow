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
import type { HandleConnectable, HandleType, ValidConnectionFunc } from '../../types';
import { Position } from '../../types';

@Component({
  selector: 'lib-handle',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content />`,
  host: {
    'class': 'vue-flow__handle',
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

  constructor() {
    afterNextRender(() => {
      this._updateHandleBounds();
    });
  }

  private _updateHandleBounds(): void {
    const el = this.el.nativeElement as HTMLElement;
    const nodeEl = el.closest('.vue-flow__node') as HTMLElement;
    if (!nodeEl) return;

    const nodeId = this._nodeId;
    if (!nodeId) return;

    // Use getBoundingClientRect so CSS transforms on handles (e.g. translate(-50%, 0))
    // are properly accounted for.  The rects are in screen-pixels which include the
    // viewport zoom (scale), so divide by zoom to get flow-coordinates consistent
    // with node.dimensions (offsetWidth/offsetHeight, not affected by zoom).
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
      if (idx >= 0) {
        existing[idx] = handleEl;
      } else {
        existing.push(handleEl);
      }
      bounds.source = existing;
    } else {
      const existing = bounds.target || [];
      const idx = existing.findIndex((h) => h.id === handleId);
      if (idx >= 0) {
        existing[idx] = handleEl;
      } else {
        existing.push(handleEl);
      }
      bounds.target = existing;
    }

    this.flow.updateNode(nodeId, { handleBounds: bounds });
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    if (!this.connectableStart()) return;
    if (!this._isConnectable()) return;
    this._startConnection(event);
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    if (!this.flow.connectOnClick()) return;

    const clickStart = this.flow.connectionClickStartHandle();
    if (clickStart) {
      this._completeClickConnection(event);
    } else {
      this._startClickConnection(event);
    }
  }

  private _startConnection(event: MouseEvent): void {
    if (!this._nodeId) return;

    const flowRef = this.flow.flowRef;
    const vp = this.flow.viewport();
    let hx = 0;
    let hy = 0;
    if (flowRef) {
      const rect = flowRef.getBoundingClientRect();
      const handleRect = (this.el.nativeElement as HTMLElement).getBoundingClientRect();
      hx = (handleRect.left + handleRect.width / 2 - rect.left - vp.x) / vp.zoom;
      hy = (handleRect.top + handleRect.height / 2 - rect.top - vp.y) / vp.zoom;
    }

    this.flow.connectionStartHandle.set({
      nodeId: this._nodeId,
      type: this.type(),
      id: this.id() ?? null,
      position: this.position(),
      x: hx,
      y: hy,
    });

    this.flow.connectStart$.next({
      event,
      nodeId: this._nodeId,
      handleId: this.id() ?? null,
      handleType: this.type(),
    });

    const onMouseMove = (e: MouseEvent) => {
      const flowRef = this.flow.flowRef;
      if (!flowRef) return;
      const rect = flowRef.getBoundingClientRect();
      const vp = this.flow.viewport();
      this.flow.connectionPosition.set({
        x: (e.clientX - rect.left - vp.x) / vp.zoom,
        y: (e.clientY - rect.top - vp.y) / vp.zoom,
      });
    };

    const onMouseUp = (e: MouseEvent) => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      this.flow.connectionStartHandle.set(null);
      this.flow.connectionEndHandle.set(null);
      this.flow.connectionStatus.set(null);
      this.flow.connectionPosition.set({ x: Number.NaN, y: Number.NaN });

      this.flow.connectEnd$.next(e);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  private _startClickConnection(event: MouseEvent): void {
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
  }

  private _completeClickConnection(event: MouseEvent): void {
    const clickStart = this.flow.connectionClickStartHandle();
    if (!clickStart || !this._nodeId) return;

    if (this.connectableEnd()) {
      const connection = {
        source: clickStart.nodeId,
        sourceHandle: clickStart.id ?? null,
        target: this._nodeId,
        targetHandle: this.id() ?? null,
      };
      this.flow.connect$.next(connection);
    }

    this.flow.connectionClickStartHandle.set(null);
    this.flow.clickConnectEnd$.next(event);
  }
}
