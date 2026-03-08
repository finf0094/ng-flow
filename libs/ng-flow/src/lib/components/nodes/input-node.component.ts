import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HandleComponent } from '../handle/handle.component';
import { Position } from '../../types';
import type { HandleConnectable } from '../../types';

@Component({
  selector: 'lib-input-node',
  standalone: true,
  imports: [CommonModule, HandleComponent],
  template: `
    <div class="vue-flow__node-label">{{ label() }}</div>
    <lib-handle [type]="'source'" [position]="sourcePosition()" />
  `,
})
export class InputNodeComponent {
  readonly id = input.required<string>();
  readonly type = input<string>('input');
  readonly label = input<string | undefined>(undefined);
  readonly data = input<any>({});
  readonly selected = input<boolean>(false);
  readonly connectable = input<HandleConnectable>(true);
  readonly sourcePosition = input<Position>(Position.Bottom);
  readonly dragging = input<boolean>(false);
  readonly resizing = input<boolean>(false);
  readonly zIndex = input<number>(0);
}
