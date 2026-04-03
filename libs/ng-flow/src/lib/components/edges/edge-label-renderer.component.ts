import { Component, computed, inject } from '@angular/core';
import { FlowService } from '../../services/flow.service';

@Component({
  selector: 'lib-edge-label-renderer',
  standalone: true,
  template: `<ng-content />`,
  host: {
    class: 'ng-flow__edge-labels',
    '[style.transform]': '_transform()',
    '[style.transformOrigin]': '"top left"',
    '[style.position]': '"absolute"',
    '[style.top]': '"0"',
    '[style.left]': '"0"',
    '[style.width]': '"100%"',
    '[style.height]': '"100%"',
    '[style.pointerEvents]': '"none"',
  },
})
export class EdgeLabelRendererComponent {
  private readonly flow = inject(FlowService);

  readonly _transform = computed(() => {
    const { x, y, zoom } = this.flow.viewport();
    return `translate(${x}px,${y}px) scale(${zoom})`;
  });
}
