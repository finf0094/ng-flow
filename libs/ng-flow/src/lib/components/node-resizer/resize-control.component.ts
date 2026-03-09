import {
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
} from '@angular/core';
import { select } from 'd3-selection';
import { drag } from 'd3-drag';
import { FlowService } from '../../services/flow.service';
import { NODE_ID_TOKEN } from '../nodes/node-id.token';
import { clamp } from '../../utils';

export type ResizeControlVariant = 'handle' | 'line';
export type ResizeControlPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'top'
  | 'right'
  | 'bottom'
  | 'left';

export interface ResizeParams {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ResizeParamsWithDirection extends ResizeParams {
  direction: [number, number];
}

@Component({
  selector: 'lib-resize-control',
  standalone: true,
  template: `<ng-content />`,
  host: {
    class: 'vue-flow__resize-control nodrag',
    '[class.handle]': 'variant() === "handle"',
    '[class.line]': 'variant() === "line"',
    '[class.top]': '_hasTop()',
    '[class.bottom]': '_hasBottom()',
    '[class.left]': '_hasLeft()',
    '[class.right]': '_hasRight()',
  },
})
export class ResizeControlComponent implements OnInit, OnDestroy {
  readonly position = input<ResizeControlPosition>('bottom-right');
  readonly variant = input<ResizeControlVariant>('handle');
  readonly nodeId = input<string>('');
  readonly minWidth = input<number>(10);
  readonly minHeight = input<number>(10);
  readonly maxWidth = input<number>(Number.MAX_VALUE);
  readonly maxHeight = input<number>(Number.MAX_VALUE);
  readonly color = input<string>('');

  readonly resizeStart = output<{ params: ResizeParams }>();
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly resize = output<{ params: ResizeParamsWithDirection }>();
  readonly resizeEnd = output<{ params: ResizeParams }>();

  private readonly flow = inject(FlowService);
  private readonly _ctxNodeId = inject(NODE_ID_TOKEN, { optional: true }) ?? '';
  private readonly el = inject(ElementRef<HTMLElement>);

  private _startValues = {
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    pointerX: 0,
    pointerY: 0,
  };
  private _prevValues = { width: 0, height: 0, x: 0, y: 0 };
  private _cleanup?: () => void;

  _hasTop = () => this.position().includes('top');
  _hasBottom = () => this.position().includes('bottom');
  _hasLeft = () => this.position().includes('left');
  _hasRight = () => this.position().includes('right');

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    // Prevent the parent node-wrapper and D3 zoom from seeing this event
    event.stopPropagation();
  }

  private get _nodeId(): string {
    return this.nodeId() || this._ctxNodeId;
  }

  ngOnInit(): void {
    this._setupDrag();
  }

  ngOnDestroy(): void {
    this._cleanup?.();
  }

  private _getPointer(event: MouseEvent): { x: number; y: number } {
    const flowRef = this.flow.flowRef;
    const vp = this.flow.viewport();
    if (!flowRef) return { x: 0, y: 0 };
    const rect = flowRef.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left - vp.x) / vp.zoom,
      y: (event.clientY - rect.top - vp.y) / vp.zoom,
    };
  }

  private _setupDrag(): void {
    this._cleanup?.();
    const pos = this.position();
    const enableX = pos.includes('right') || pos.includes('left');
    const enableY = pos.includes('bottom') || pos.includes('top');
    const invertX = pos.includes('left');
    const invertY = pos.includes('top');

    const selection = select(this.el.nativeElement);

    const dragBehavior = drag<HTMLElement, unknown>()
      .on('start', (event) => {
        event.sourceEvent.stopPropagation();
        const nid = this._nodeId;
        const node = this.flow.getNode(nid);
        if (!node) return;

        const p = this._getPointer(event.sourceEvent as MouseEvent);
        this._prevValues = {
          width: node.dimensions.width ?? 0,
          height: node.dimensions.height ?? 0,
          x: node.position.x,
          y: node.position.y,
        };
        this._startValues = {
          ...this._prevValues,
          pointerX: p.x,
          pointerY: p.y,
        };
        this.resizeStart.emit({ params: { ...this._prevValues } });
      })
      .on('drag', (event) => {
        const nid = this._nodeId;
        if (!nid) return;
        const p = this._getPointer(event.sourceEvent as MouseEvent);
        const sv = this._startValues;

        const distX = enableX ? p.x - sv.pointerX : 0;
        const distY = enableY ? p.y - sv.pointerY : 0;

        const newW = clamp(
          sv.width + (invertX ? -distX : distX),
          this.minWidth(),
          this.maxWidth(),
        );
        const newH = clamp(
          sv.height + (invertY ? -distY : distY),
          this.minHeight(),
          this.maxHeight(),
        );

        const wChanged = newW !== this._prevValues.width;
        const hChanged = newH !== this._prevValues.height;

        const newX = invertX && wChanged ? sv.x - (newW - sv.width) : sv.x;
        const newY = invertY && hChanged ? sv.y - (newH - sv.height) : sv.y;

        const dW = newW - this._prevValues.width;
        const dH = newH - this._prevValues.height;
        const direction: [number, number] = [
          invertX
            ? dW < 0
              ? 1
              : dW > 0
                ? -1
                : 0
            : dW > 0
              ? 1
              : dW < 0
                ? -1
                : 0,
          invertY
            ? dH < 0
              ? 1
              : dH > 0
                ? -1
                : 0
            : dH > 0
              ? 1
              : dH < 0
                ? -1
                : 0,
        ];

        if (wChanged || hChanged) {
          this._prevValues = { width: newW, height: newH, x: newX, y: newY };
          this.flow.updateNode(nid, {
            position: { x: newX, y: newY },
            style: { width: `${newW}px`, height: `${newH}px` },
          });
          this.resize.emit({ params: { ...this._prevValues, direction } });
        }
      })
      .on('end', () => {
        this.resizeEnd.emit({ params: { ...this._prevValues } });
      });

    selection.call(dragBehavior);
    this._cleanup = () => selection.on('.drag', null);
  }
}
