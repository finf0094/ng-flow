import {
  AfterViewInit,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlowService } from '../../services/flow.service';
import { NodeWrapperComponent } from './node-wrapper.component';

@Component({
  selector: 'lib-node-renderer',
  standalone: true,
  imports: [CommonModule, NodeWrapperComponent],
  template: `
    <div class="vue-flow__nodes vue-flow__container">
      @if (resizeObserver()) {
        @for (node of flow.getNodes(); track node.id) {
          <lib-node-wrapper
            [id]="node.id"
            [resizeObserver]="resizeObserver()"
          />
        }
      }
    </div>
  `,
})
export class NodeRendererComponent implements OnInit, OnDestroy {
  readonly flow = inject(FlowService);

  readonly resizeObserver = signal<ResizeObserver | null>(null);

  ngOnInit(): void {
    const ro = new ResizeObserver((entries) => {
      const updates = entries.map((entry) => ({
        id: entry.target.getAttribute('data-id') as string,
        nodeElement: entry.target as HTMLDivElement,
        forceUpdate: true,
      }));

      this.flow.updateNodeDimensions(updates);

      const allInitialized = this.flow.nodes().every(
        (n) => n.dimensions.width > 0 && n.dimensions.height > 0,
      );
      if (allInitialized && !this.flow.initialized()) {
        this.flow.initialized.set(true);
        this.flow.nodesInitialized$.next(this.flow.getNodes());
      }
    });

    this.resizeObserver.set(ro);
  }

  ngOnDestroy(): void {
    this.resizeObserver()?.disconnect();
  }
}
