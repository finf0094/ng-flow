import { Component, input, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-base-edge',
  standalone: true,
  imports: [CommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  template: `
    <path
      [attr.id]="id()"
      [attr.d]="path()"
      fill="none"
      class="vue-flow__edge-path"
      [ngStyle]="style()"
    />
    <path
      v-if="interactionWidth()"
      [attr.d]="path()"
      fill="none"
      stroke-opacity="0"
      [attr.stroke-width]="interactionWidth()"
      class="vue-flow__edge-interaction"
    />
    @if (label()) {
      <g [attr.transform]="'translate(' + (labelX() ?? 0) + ' ' + (labelY() ?? 0) + ')'">
        @if (labelShowBg()) {
          <rect
            [attr.height]="_labelHeight"
            [attr.rx]="labelBgBorderRadius()"
            [attr.ry]="labelBgBorderRadius()"
            [ngStyle]="labelBgStyle()"
            class="vue-flow__edge-textbg"
          />
        }
        <text class="vue-flow__edge-text" [ngStyle]="labelStyle()" text-anchor="middle" dominant-baseline="middle">
          {{ label() }}
        </text>
      </g>
    }
  `,
})
export class BaseEdgeComponent {
  readonly id = input<string | undefined>(undefined);
  readonly path = input.required<string>();
  readonly labelX = input<number | undefined>(undefined);
  readonly labelY = input<number | undefined>(undefined);
  readonly label = input<string | undefined>(undefined);
  readonly labelStyle = input<Record<string, any> | undefined>(undefined);
  readonly labelShowBg = input<boolean>(true);
  readonly labelBgStyle = input<Record<string, any> | undefined>(undefined);
  readonly labelBgPadding = input<[number, number]>([2, 4]);
  readonly labelBgBorderRadius = input<number>(2);
  readonly markerStart = input<string | undefined>(undefined);
  readonly markerEnd = input<string | undefined>(undefined);
  readonly interactionWidth = input<number>(20);
  readonly style = input<Record<string, any> | undefined>(undefined);

  readonly _labelHeight = 12;
}
