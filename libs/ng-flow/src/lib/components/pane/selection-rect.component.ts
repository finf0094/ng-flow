import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { SelectionRect } from '../../types';

@Component({
  selector: 'lib-selection-rect',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="vue-flow__selection vue-flow__container"
      [style.left.px]="rect().x"
      [style.top.px]="rect().y"
      [style.width.px]="rect().width"
      [style.height.px]="rect().height"
    ></div>
  `,
})
export class SelectionRectComponent {
  readonly rect = input.required<SelectionRect>();
}
