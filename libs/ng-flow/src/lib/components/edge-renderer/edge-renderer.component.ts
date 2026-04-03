import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlowService } from '../../services/flow.service';
import { MarkerDefsComponent } from './marker-defs.component';
import { EdgeWrapperComponent } from './edge-wrapper.component';

@Component({
  selector: 'lib-edge-renderer',
  standalone: true,
  imports: [CommonModule, MarkerDefsComponent, EdgeWrapperComponent],
  template: `
    <lib-marker-defs />
    @for (edge of flow.getEdges(); track edge.id) {
      <lib-edge-wrapper [id]="edge.id" />
    }
  `,
  styles: [`:host { display: contents; }`],
})
export class EdgeRendererComponent {
  readonly flow = inject(FlowService);
}
