import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseEdgeComponent } from './base-edge.component';
import { Position } from '../../types';
import { getSmoothStepPath } from '../../utils/edges/smooth-step';

@Component({
  selector: 'lib-smooth-step-edge',
  standalone: true,
  imports: [CommonModule, BaseEdgeComponent],
  template: `
    <lib-base-edge
      [path]="_path()[0]"
      [labelX]="_path()[1]"
      [labelY]="_path()[2]"
      [id]="id()"
      [label]="label()"
      [labelStyle]="labelStyle()"
      [labelShowBg]="labelShowBg()"
      [labelBgStyle]="labelBgStyle()"
      [labelBgPadding]="labelBgPadding()"
      [labelBgBorderRadius]="labelBgBorderRadius()"
      [markerStart]="markerStart()"
      [markerEnd]="markerEnd()"
      [interactionWidth]="interactionWidth()"
      [style]="style()"
    />
  `,
})
export class SmoothStepEdgeComponent {
  readonly id = input<string | undefined>(undefined);
  readonly sourceX = input.required<number>();
  readonly sourceY = input.required<number>();
  readonly targetX = input.required<number>();
  readonly targetY = input.required<number>();
  readonly sourcePosition = input<Position>(Position.Bottom);
  readonly targetPosition = input<Position>(Position.Top);
  readonly borderRadius = input<number>(5);
  readonly offset = input<number>(20);
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

  readonly _path = computed(() =>
    getSmoothStepPath({
      sourceX: this.sourceX(),
      sourceY: this.sourceY(),
      targetX: this.targetX(),
      targetY: this.targetY(),
      sourcePosition: this.sourcePosition(),
      targetPosition: this.targetPosition(),
      borderRadius: this.borderRadius(),
      offset: this.offset(),
    }),
  );
}
