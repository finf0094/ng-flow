import { Component, NO_ERRORS_SCHEMA, computed, input, output } from '@angular/core';
import type { GraphNode, XYPosition } from '../../types';

export type ShapeRendering = 'auto' | 'optimizeSpeed' | 'crispEdges' | 'geometricPrecision';

@Component({
  selector: 'lib-minimap-node',
  standalone: true,
  schemas: [NO_ERRORS_SCHEMA],
  host: { style: 'display: contents' },
  template: `
    @if (!hidden() && dimensions().width && dimensions().height) {
      <rect
        class="vue-flow__minimap-node"
        [class.selected]="selected()"
        [class.dragging]="dragging()"
        [attr.x]="position().x"
        [attr.y]="position().y"
        [attr.width]="dimensions().width"
        [attr.height]="dimensions().height"
        [attr.rx]="borderRadius()"
        [attr.ry]="borderRadius()"
        [attr.fill]="color()"
        [attr.stroke]="strokeColor()"
        [attr.stroke-width]="strokeWidth()"
        [attr.shape-rendering]="shapeRendering()"
        (click)="nodeClick.emit($event)"
        (keydown.enter)="nodeClick.emit($any($event))"
        (dblclick)="nodeDblclick.emit($event)"
        (mouseenter)="nodeMouseenter.emit($event)"
        (mousemove)="nodeMousemove.emit($event)"
        (mouseleave)="nodeMouseleave.emit($event)"
      />
    }
  `,
})
export class MiniMapNodeComponent {
  readonly node = input.required<GraphNode>();
  readonly color = input<string>('#e2e2e2');
  readonly strokeColor = input<string>('transparent');
  readonly strokeWidth = input<number>(2);
  readonly borderRadius = input<number>(5);
  readonly shapeRendering = input<ShapeRendering>('crispEdges');

  readonly nodeClick = output<MouseEvent>();
  readonly nodeDblclick = output<MouseEvent>();
  readonly nodeMouseenter = output<MouseEvent>();
  readonly nodeMousemove = output<MouseEvent>();
  readonly nodeMouseleave = output<MouseEvent>();

  readonly hidden = computed(() => !!this.node().hidden);
  readonly selected = computed(() => !!this.node().selected);
  readonly dragging = computed(() => !!this.node().dragging);
  readonly position = computed<XYPosition>(() => this.node().computedPosition ?? { x: 0, y: 0 });
  readonly dimensions = computed(() => this.node().dimensions ?? { width: 0, height: 0 });
}
