import { Component, computed, input, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EdgeAnchorComponent } from './edge-anchor.component';

@Component({
  selector: 'lib-base-edge',
  standalone: true,
  imports: [CommonModule, EdgeAnchorComponent],
  schemas: [NO_ERRORS_SCHEMA],
  template: `
    <svg style="overflow:visible;pointer-events:none;position:absolute;top:0;left:0;width:100%;height:100%">
      <path
        [attr.id]="id()"
        [attr.d]="path()"
        fill="none"
        class="ng-flow__edge-path"
        [ngStyle]="style()"
        [attr.marker-start]="markerStart() || null"
        [attr.marker-end]="markerEnd() || null"
      />
      @if (interactionWidth()) {
        <path
          [attr.d]="path()"
          fill="none"
          stroke-opacity="0"
          [attr.stroke-width]="interactionWidth()"
          class="ng-flow__edge-interaction"
        />
      }
      @if (label()) {
        <g [attr.transform]="'translate(' + (labelX() ?? 0) + ' ' + (labelY() ?? 0) + ')'">
          @if (labelShowBg()) {
            <rect
              [attr.height]="_labelHeight"
              [attr.rx]="labelBgBorderRadius()"
              [attr.ry]="labelBgBorderRadius()"
              [ngStyle]="labelBgStyle()"
              class="ng-flow__edge-textbg"
            />
          }
          <text class="ng-flow__edge-text" [ngStyle]="labelStyle()" text-anchor="middle" dominant-baseline="middle">
            {{ label() }}
          </text>
        </g>
      }
      @if (_showSourceAnchor()) {
        <circle lib-edge-anchor [x]="sourceX()" [y]="sourceY()" handleType="source" />
      }
      @if (_showTargetAnchor()) {
        <circle lib-edge-anchor [x]="targetX()" [y]="targetY()" handleType="target" />
      }
    </svg>
  `,
})
export class BaseEdgeComponent {
  readonly id = input<string | undefined>(undefined);
  readonly path = input.required<string>();
  readonly sourceX = input<number>(0);
  readonly sourceY = input<number>(0);
  readonly targetX = input<number>(0);
  readonly targetY = input<number>(0);
  readonly updatable = input<boolean | 'source' | 'target'>(false);
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

  readonly _showSourceAnchor = computed(() => {
    const u = this.updatable();
    return u === true || u === 'source';
  });

  readonly _showTargetAnchor = computed(() => {
    const u = this.updatable();
    return u === true || u === 'target';
  });
}
