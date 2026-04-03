import { Component, input, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-marker-symbol',
  standalone: true,
  imports: [CommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  template: `
    <marker
      [attr.id]="id()"
      class="ng-flow__arrowhead"
      viewBox="-10 -10 20 20"
      refX="0"
      refY="0"
      [attr.markerWidth]="width()"
      [attr.markerHeight]="height()"
      [attr.markerUnits]="markerUnits()"
      [attr.orient]="orient()"
    >
      @if (type() === 'arrowclosed') {
        <polyline
          points="-5,-4 0,0 -5,4 -5,-4"
          [ngStyle]="{ stroke: color(), fill: color(), 'stroke-width': strokeWidth() ?? 1 }"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      }
      @if (type() === 'arrow') {
        <polyline
          points="-5,-4 0,0 -5,4"
          fill="none"
          [ngStyle]="{ stroke: color(), 'stroke-width': strokeWidth() ?? 1 }"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      }
    </marker>
  `,
})
export class MarkerSymbolComponent {
  readonly id = input.required<string>();
  readonly type = input.required<string>();
  readonly color = input<string>('none');
  readonly width = input<number>(12.5);
  readonly height = input<number>(12.5);
  readonly markerUnits = input<string>('strokeWidth');
  readonly orient = input<string>('auto-start-reverse');
  readonly strokeWidth = input<number | undefined>(undefined);
}
