import { Component, inject, input, output } from '@angular/core';
import { NODE_ID_TOKEN } from '../nodes/node-id.token';
import {
  ResizeControlComponent,
  ResizeControlPosition,
  ResizeParams,
  ResizeParamsWithDirection,
} from './resize-control.component';

const HANDLE_POSITIONS: ResizeControlPosition[] = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
];

const LINE_POSITIONS: ResizeControlPosition[] = [
  'top',
  'right',
  'bottom',
  'left',
];

@Component({
  selector: 'lib-node-resizer',
  standalone: true,
  imports: [ResizeControlComponent],
  template: `
    @if (isVisible()) {
      @for (pos of _linePositions; track pos) {
        <lib-resize-control
          [position]="pos"
          variant="line"
          [nodeId]="_nodeId()"
          [minWidth]="minWidth()"
          [minHeight]="minHeight()"
          [maxWidth]="maxWidth()"
          [maxHeight]="maxHeight()"
          [color]="color()"
          (resizeStart)="resizeStart.emit($event)"
          (resize)="resize.emit($event)"
          (resizeEnd)="resizeEnd.emit($event)"
        />
      }
      @for (pos of _handlePositions; track pos) {
        <lib-resize-control
          [position]="pos"
          variant="handle"
          [nodeId]="_nodeId()"
          [minWidth]="minWidth()"
          [minHeight]="minHeight()"
          [maxWidth]="maxWidth()"
          [maxHeight]="maxHeight()"
          [color]="color()"
          (resizeStart)="resizeStart.emit($event)"
          (resize)="resize.emit($event)"
          (resizeEnd)="resizeEnd.emit($event)"
        />
      }
    }
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
})
export class NodeResizerComponent {
  readonly isVisible = input<boolean>(true);
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

  private readonly _ctxNodeId = inject(NODE_ID_TOKEN, { optional: true }) ?? '';

  _nodeId = () => this.nodeId() || this._ctxNodeId;

  readonly _handlePositions = HANDLE_POSITIONS;
  readonly _linePositions = LINE_POSITIONS;
}
