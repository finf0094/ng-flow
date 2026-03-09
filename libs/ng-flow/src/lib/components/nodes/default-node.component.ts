import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HandleComponent } from '../handle/handle.component';
import { Position } from '../../types';
import type { HandleConnectable } from '../../types';
import { NodeResizerComponent } from '../node-resizer/node-resizer.component';

@Component({
  selector: 'lib-default-node',
  standalone: true,
  imports: [CommonModule, HandleComponent, NodeResizerComponent],
  template: `
    <lib-handle [type]="'target'" [position]="targetPosition()" />
    <div class="vue-flow__node-label">{{ label() }}</div>
    <lib-handle [type]="'source'" [position]="sourcePosition()" />
  `,
})
export class DefaultNodeComponent {
  readonly id = input.required<string>();
  readonly type = input<string>('default');
  readonly label = input<string | undefined>(undefined);
  readonly data = input<any>({});
  readonly selected = input<boolean>(false);
  readonly connectable = input<HandleConnectable>(true);
  readonly sourcePosition = input<Position>(Position.Bottom);
  readonly targetPosition = input<Position>(Position.Top);
  readonly dragging = input<boolean>(false);
  readonly resizing = input<boolean>(false);
  readonly zIndex = input<number>(0);
}
